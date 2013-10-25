define(['jquery', 'app/engine', 'app/graphics', 'app/eventmanager', 'app/entity/tile', 
        'app/resources', 'app/gamecontent', 'app/gamestate'], 
		function($, Engine, Graphics, EventManager, Tile, Resources, Content, State) {
	return {
		dropCount: 0,
		removals: 0,
		checkQueue: [],
		
		options : {
			rows : 8,
			columns : 8
		},
		init : function(opts) {
			$.extend(this.options, opts);
			this._el = null;
			Graphics.clearBoard();
			Graphics.addToScreen(this);
			this.tiles = [];
			this.filling = false;
			for (var i = 0; i < this.options.columns; i++) {
				this.tiles.push([]);
			}
		},

		el : function() {
			if (this._el == null) {
				this._el = Graphics.createBoard(this.options.rows, this.options.columns);
			}
			return this._el;
		},
		
		tileMap: function() {
			var map = {
				'grain' : 2,
				'wood' : 2,
				'stone' : 2
			};
			
			if(State.hasBuilding(Content.BuildingType.BrickLayer)) {
				map.clay = 2;
			}
			
			if(State.hasBuilding(Content.BuildingType.Weaver)) {
				map.cloth = 2;
			}
			
			return map;
		},
		
		fill : function() {
			this.filling = true;
			setTimeout(function() {
				require(['app/gameboard'], function(GameBoard) {
					GameBoard._doFill(0);
				});
			}, 100);
		},

		_doFill : function(num) {
			require(['app/gameboard', 'app/entity/tile'], function(GameBoard, Tile) {

				var row = 7 - Math.floor(num / GameBoard.options.columns);
				var col = Math.floor(num % GameBoard.options.rows);

				// console.log('[' + row + ', ' + col + ']');

				// Pieces to the left and the bottom could potentially be present
				var pCounts = GameBoard.tileMap();
				if (col > 0) {
					var sibling = GameBoard.tiles[col - 1][row];
					pCounts[sibling.options.type.className]--;
					if (col > 1 && GameBoard.tiles[col - 2][row].options.type.className == sibling.options.type.className) {
						// console.log('horizontal detection: ' + sibling.options.type.className + ' == ' + GameBoard.tiles[col - 2][row].options.type.className);
						pCounts[sibling.options.type.className]--;
					}
				}
				if (row < GameBoard.options.rows - 1) {
					var sibling = GameBoard.tiles[col][row + 1];
					pCounts[sibling.options.type.className]--;
					if (row < GameBoard.options.rows - 2 && GameBoard.tiles[col][row + 2].options.type.className == sibling.options.type.className) {
						// console.log('vertical detection: ' + sibling.options.type.className + ' == ' + GameBoard.tiles[col][row + 2].options.type.className);
						pCounts[sibling.options.type.className]--;
					}
				}
				var total = 0;
				for (tileClass in pCounts) {
					pCounts[tileClass] = pCounts[tileClass] < 0 ? 0 : pCounts[tileClass];
					total += pCounts[tileClass];
				}

				var baseline = 0;
				var r = Math.random();
				var theClass = "";
				for (tileClass in pCounts) {
					theClass = tileClass;
					var chance = pCounts[tileClass] / total;
					// console.log(tileClass + ': ' + r + ' < ' + baseline + ' + ' + pCounts[tileClass]  + ' / ' + total  + ' (' + chance + ')');
					if (r < baseline + chance) {
						break;
					}
					baseline += chance;
				}
				var type = Content.getResourceType(theClass);
				
				GameBoard.dropTiles(GameBoard.addTiles([new Tile({
					type : type,
					row: -1,
					column: col
				})]));
				
				if (num < GameBoard.options.columns * GameBoard.options.rows - 1) {
					setTimeout(function() {
						require(['app/gameboard'], function(GameBoard) {
							GameBoard._doFill(num + 1);
						});
					}, 20);
				}
			});
		},
		
		addTiles: function(tiles) {
			Graphics.addTilesToContainer(tiles);
			for(var t in tiles) {
				var tile = tiles[t];
				tile.el().removeClass('hidden');
				Graphics.setPositionInBoard(tile, tile.options.row, tile.options.column);
			}
			return tiles;
		},
		
		dropTiles: function(tiles) {
			this.dropCount++;
			for(var t in tiles) {
				var tile = tiles[t];
				if($.inArray(tile, this.checkQueue) == -1) {
					this.checkQueue.push(tile);
				}
				var col = this.tiles[tile.options.column];
				var finalRow = tile.options.row;
				while (finalRow < this.options.rows - 1 && col[finalRow + 1] == null) {
					finalRow++;
				}
				// Don't drop the tile if the column is full
				if (finalRow < 0) {
					throw "Cannot drop tile in full columns, idiot!";
				}
				if(tile.options.row >= 0) {
					this.tiles[tile.options.column][tile.options.row] = null;
				}
				this.tiles[tile.options.column][finalRow] = tile;
				tile.options.row = finalRow;
			}
			
			Graphics.dropTiles(tiles, function() {
				require(['app/graphics', 'app/gameboard', 'app/eventmanager'], function(Graphics, GameBoard, EventManager) {
					GameBoard.dropCount--;
					if(GameBoard.dropCount == 0) {
						var matches = [];
						while(GameBoard.checkQueue.length > 0) {
							var curMatches = GameBoard.checkMatches(GameBoard.checkQueue.pop());
							for(var m in curMatches) {
								var match = curMatches[m];
								if($.inArray(match, matches) == -1) {
									matches.push(match);
								}
							}
						}
						if(matches.length > 0) {
							GameBoard.handleMatches(matches);
						} else if(!GameBoard.areMovesAvailable()) {
							GameBoard.noMoreMoves();
						} else if(!GameBoard.filling) {
							EventManager.trigger('tilesSwapped');
						} else if(GameBoard.filling) {
							GameBoard.filling = false;
						}
					}
				});
			});
		},
		
		noMoreMoves: function() {
			// Refresh the board and incur penalties
			GameBoard.refreshBoard();
			EventManager.trigger('noMoreMoves');
		},
		
		refreshBoard: function() {
			var tiles = [];
			for(var c in this.tiles) {
				var col = this.tiles[c];
				for(var r in col) {
					var tile = col[r];
					if(tile != null) {
						tiles.push(tile);
					}
				}
				col.length = 0;
			}
			
			Graphics.removeTiles(tiles, this.fill);
		},
		
		handleMatches: function(tiles) {
			
			this.removals++;
			var newTiles = [];
			var colsToDrop = {};
			var resourcesGained = {};

			// Remove matched tiles
			for(t in tiles) {
				var tileToRemove = tiles[t];
				var gained = resourcesGained[tileToRemove.options.type.className] || 0;
				resourcesGained[tileToRemove.options.type.className] = gained + 1;
				if(this.tiles[tileToRemove.options.column][tileToRemove.options.row] != null) {
					this.tiles[tileToRemove.options.column][tileToRemove.options.row] = null;
					if(colsToDrop[tileToRemove.options.column] == null) {
						colsToDrop[tileToRemove.options.column] = 0;
					}
					colsToDrop[tileToRemove.options.column]++;
				}
				tileToRemove.options.row = -1;
			}
			
			EventManager.trigger('tilesCleared', [resourcesGained]);
			
			Graphics.removeTiles(tiles, function() {
				require(['app/gameboard', 'app/entity/tile', 'app/resources', 'app/gamecontent', 'app/gamestate'], 
						function(GameBoard, Tile, Resources, Content, State) {
					
					// Drop remaining tiles
					var pCounts = GameBoard.tileMap();
					var nextCount = 0;
					var newTiles = [];
					var dropList = [];
					for(col in colsToDrop) {
						for(var r = GameBoard.options.rows - 1; r >= 0; r--) {
							if(GameBoard.tiles[col][r] != null) {
								dropList.push(GameBoard.tiles[col][r]);
							}
						}
						for(var i = 1, num = colsToDrop[col]; i <= num; i++) {
							var probs = {};
							for(var p in pCounts) {
								probs[p] = pCounts[p] / nextCount;
							}
							var r = Math.random();
							var base = 0;
							var typeClass = "";
							for(var className in probs) {
								typeClass = className;
								var prob = probs[className];
//								console.log(className + ": " + r + " < " + prob + " + " + base);
								if(r < prob + base) {
									break;
								}
								base += prob;
							}
							var type = Content.getResourceType(typeClass);
							nextCount = 0;
							for(var t in pCounts) {
								if(t == type.className) {
									pCounts[t]--;
								} else {
									pCounts[t] = 2;
								}
								nextCount += pCounts[t];
							}
							newTiles.push(new Tile({
								column: parseInt(col),
								row: -i,
								type: type
							}));
						}
					}
					
					dropList = dropList.concat(newTiles);
					GameBoard.addTiles(newTiles);
					GameBoard.dropTiles(dropList);
					
					GameBoard.removals--;
					if(GameBoard.removals < 0) GameBoard.removals = 0;
				});
			});
		},
		
		switchTiles: function(tile1, tile2, skipMatch) {
			Graphics.switchTiles(tile1, tile2, function(tile1, tile2) {
				require(['app/gameboard', 'app/eventmanager'], function(GameBoard, EventManager) {
					var r1 = tile1.options.row, c1 = tile1.options.column;
					GameBoard.tiles[tile1.options.column][tile1.options.row] = tile2;
					GameBoard.tiles[tile2.options.column][tile2.options.row] = tile1;
					tile1.options.row = tile2.options.row;
					tile1.options.column = tile2.options.column;
					tile2.options.row = r1;
					tile2.options.column = c1;
					
					if(!skipMatch) {
						GameBoard.swapSide = tile1.options.column < GameBoard.options.columns / 2 ? 'left' : 'right';
						// Check for matches
						var matches = GameBoard.checkMatches(tile1);
						matches = matches.concat(GameBoard.checkMatches(tile2));
					
						if(matches.length > 0) {
							GameBoard.handleMatches(matches);
						} else {
							GameBoard.switchTiles(tile1, tile2, true);
							EventManager.trigger('tilesSwapped');
						}
					}
				});
			});
		},
		
		checkMatches: function(tile) {
			var hMatches = [tile], vMatches = [tile];			
			if(tile.options.column > 0) {
				var testTile = this.tiles[tile.options.column - 1][tile.options.row];
				while(testTile != null && testTile.options.type == tile.options.type) {
					hMatches.push(testTile);
					if(testTile.options.column == 0) break;
					testTile = this.tiles[testTile.options.column - 1][testTile.options.row];
				}
			}
			if(tile.options.column < this.options.columns - 1) {
				var testTile = this.tiles[tile.options.column + 1][tile.options.row];
				while(testTile != null && testTile.options.type == tile.options.type) {
					hMatches.push(testTile);
					if(testTile.options.column == this.options.columns - 1) break;
					testTile = this.tiles[testTile.options.column + 1][testTile.options.row];
				}
			}
			if(tile.options.row > 0) {
				var testTile = this.tiles[tile.options.column][tile.options.row - 1];
				while(testTile != null && testTile.options.type == tile.options.type) {
					vMatches.push(testTile);
					if(testTile.options.row == 0) break;
					testTile = this.tiles[testTile.options.column][testTile.options.row - 1];
				}
			}
			if(tile.options.row < this.options.rows - 1) {
				var testTile = this.tiles[tile.options.column][tile.options.row + 1];
				while(testTile != null && testTile.options.type == tile.options.type) {
					vMatches.push(testTile);
					if(testTile.options.row == this.options.rows - 1) break;
					testTile = this.tiles[testTile.options.column][testTile.options.row + 1];
				}
			}

			// Only return matches that form rows/columns of three or more
			var matches = [];
			if(hMatches.length >= 3) {
				matches = matches.concat(hMatches);
			}
			if(vMatches.length >= 3) {
				for(var t in vMatches) {
					var tile = vMatches[t];
					if($.inArray(tile, matches) == -1) {
						matches.push(tile);
					}
				}
			}

			return matches;
		},
		
		areMovesAvailable: function() {
			// scan rows
			for(var row = 0; row < this.options.rows; row++) {
				for(var center = 1; center < this.options.columns - 1; center++) {
					var frame = [
						this.tiles[center - 1][row],
						this.tiles[center][row],
						this.tiles[center + 1][row]
					];
					
					/* The three possible patterns are:
					 * xox, xxo, oxx
					 * No other patterns can result in a move
					 */
					if(frame[0] != null && frame[1] != null && frame[0].options.type == frame[1].options.type) {
						// xxo
						var type = frame[0].options.type;
						if(row < this.options.rows - 1 && this.tiles[center + 1][row + 1] != null &&
								this.tiles[center + 1][row + 1].options.type == type) {
							return true;	
						}
						if(row > 0 && this.tiles[center + 1][row - 1] && 
								this.tiles[center + 1][row - 1].options.type == type) {
							return true;
						}
						if(center < this.options.columns - 2 && this.tiles[center + 2][row] != null &&
								this.tiles[center + 2][row].options.type == type) {
							return true;
						}
					}
					if(frame[0] != null && frame[2] != null && frame[0].options.type == frame[2].options.type) {
						// xox
						var type = frame[0].options.type;
						if(row < this.options.rows - 1 && this.tiles[center][row + 1] != null &&
								this.tiles[center][row + 1].options.type == type) {
							return true;	
						}
						if(row > 0 && this.tiles[center][row - 1] != null &&
								this.tiles[center][row - 1].options.type == type) {
							return true;
						}
					}
					if(frame[1] != null && frame[2] != null && frame[1].options.type == frame[2].options.type) {
						// oxx
						var type = frame[1].options.type;
						if(row < this.options.rows - 1 && this.tiles[center - 1][row + 1] != null && 
								this.tiles[center - 1][row + 1].options.type == type) {
							return true;	
						}
						if(row > 0 && this.tiles[center - 1][row - 1] != null && 
								this.tiles[center - 1][row - 1].options.type == type) {
							return true;
						}
						if(center > 1 && this.tiles[center - 2][row] != null && 
								this.tiles[center - 2][row].options.type == type) {
							return true;
						}
					}
				}
			}
			// scan columns
			for(var column = 0; column < this.options.columns; column++) {
				for(var center = 1; center < this.options.rows - 1; center++) {
					var frame = [
						this.tiles[column][center - 1],
						this.tiles[column][center],
						this.tiles[column][center + 1]
					];
					
					/* The three possible patterns are:
					 * x  x  o
					 * o  x  x
					 * x, o, x 
					 * No other patterns can result in a move
					 */
					if(frame[0] != null && frame[1] != null && frame[0].options.type == frame[1].options.type) {
						/*  x
						 *  x
						 *  o
						 */ 
						var type = frame[0].options.type;
						if(column < this.options.column - 1 && this.tiles[column + 1][center + 1] != null && 
								this.tiles[column + 1][center + 1].options.type == type) {
							return true;	
						}
						if(column > 0 && this.tiles[column - 1][center + 1] != null && 
								this.tiles[column - 1][center + 1].options.type == type) {
							return true;
						}
						if(center < this.options.rows - 2 && this.tiles[column][center + 2] != null && 
								this.tiles[column][center + 2].options.type == type) {
							return true;
						}
					}
					if(frame[0] != null && frame[2] != null && frame[0].options.type == frame[2].options.type) {
						/*  x
						 *  o
						 *  x
						 */
						var type = frame[0].options.type;
						if(column < this.options.columns - 1 && this.tiles[column + 1][center] != null && 
								this.tiles[column + 1][center].options.type == type) {
							return true;	
						}
						if(column > 0 && this.tiles[column - 1][center] != null && 
								this.tiles[column - 1][center].options.type == type) {
							return true;
						}
					}
					if(frame[1] != null && frame[2] != null && frame[1].options.type == frame[2].options.type) {
						/*  o
						 *  x
						 *  x
						 */
						var type = frame[1].options.type;
						if(column < this.options.column - 1 && this.tiles[column + 1][center - 1] != null && 
								this.tiles[column + 1][center - 1].options.type == type) {
							return true;	
						}
						if(column > 0 && this.tiles[column - 1][center - 1] != null && 
								this.tiles[column - 1][center - 1].options.type == type) {
							return true;
						}
						if(center > 1 && this.tiles[column][center - 2] != null && 
								this.tiles[column][center - 2].options.type == type) {
							return true;
						}
					}
				}
			}
			return false;
		}
	};
});
