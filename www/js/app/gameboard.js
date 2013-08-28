define(['jquery', 'app/engine', 'app/graphics', 'app/entity/tile'], function($, Engine, Graphics, Tile) {
	return {
		fallingTiles: 0,
		checkQueue: [],
		
		options : {
			rows : 8,
			columns : 8
		},
		init : function(opts) {
			$.extend(this.options, opts);
			Graphics.addToScreen(this);
			this.tiles = [];
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

		fill : function() {
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

				// Pieces to the left and the bottom could potetially be present
				var pCounts = {
					'grain' : 2,
					'wood' : 2,
					'stone' : 2
				};
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
				var theClass;
				for (tileClass in pCounts) {
					theClass = tileClass;
					var chance = pCounts[tileClass] / total;
					// console.log(tileClass + ': ' + r + ' < ' + baseline + ' + ' + pCounts[tileClass]  + ' / ' + total  + ' (' + chance + ')');
					if (r < baseline + chance) {
						break;
					}
					baseline += chance;
				}
				var type;
				for (t in Tile.TYPE) {
					if (Tile.TYPE[t].className == theClass) {
						type = Tile.TYPE[t];
						break;
					}
				}

				GameBoard.addTile(new Tile({
					type : type,
					row: -1,
					column: col
				}));

				if (num < GameBoard.options.columns * GameBoard.options.rows - 1) {
					setTimeout(function() {
						require(['app/gameboard'], function(GameBoard) {
							GameBoard._doFill(num + 1);
						});
					}, 20);
				}
			});
		},

		addTile : function(tile) {
			require(['app/engine'], function(Engine) {
				Engine.bindTile(tile);
			});
			if(tile.options.row == null) {
				tile.options.row = -1;
			}
			Graphics.setPositionInBoard(tile, tile.options.row, tile.options.column);
			Graphics.addToTileContainer(tile);
			this.dropTile(tile);
		},
		
		dropTile: function(tile) {
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
			this.fallingTiles++;
			Graphics.dropTile(tile, finalRow, function() {
				require(['app/graphics', 'app/gameboard'], function(Graphics, GameBoard) {
					GameBoard.fallingTiles--;
					if(GameBoard.fallingTiles == 0) {
						var matches = [];
						while(GameBoard.checkQueue.length > 0) {
							matches = matches.concat(GameBoard.checkMatches(GameBoard.checkQueue.pop()));
						}
						if(matches.length > 0) {
							GameBoard.removeTiles(matches);
						}
					}
				});
			});
		},
		
		removeTiles: function(tiles) {
			Graphics.removeTiles(tiles, function() {
				require(['app/gameboard', 'app/entity/tile'], function(GameBoard, Tile) {
					var newTiles = [];
					var colsToDrop = {};
					for(t in tiles) {
						var tileToRemove = tiles[t];
						if(GameBoard.tiles[tileToRemove.options.column][tileToRemove.options.row] != null) {
							GameBoard.tiles[tileToRemove.options.column][tileToRemove.options.row] = null;
							if(colsToDrop[tileToRemove.options.column] == null) {
								colsToDrop[tileToRemove.options.column] = 0;
							}
							colsToDrop[tileToRemove.options.column]++;
						}
					}
					for(col in colsToDrop) {
						for(var r = GameBoard.options.rows - 1; r >= 0; r--) {
							if(GameBoard.tiles[col][r] != null) {
								GameBoard.dropTile(GameBoard.tiles[col][r]);
							}
						}
						for(var i = 1, num = colsToDrop[col]; i <= num; i++) {
							var r = Math.random();
							var type = Tile.TYPE.Stone;
							if(r < 0.33) {
								type = Tile.TYPE.Grain
							} else if(r < 0.66) {
								type = Tile.TYPE.Wood
							}
							GameBoard.addTile(new Tile({
								column: parseInt(col),
								row: -i,
								type: type
							}));
						}
					}
				});
			});
		},
		
		switchTiles: function(tile1, tile2) {
			Graphics.switchTiles(tile1, tile2, function(tile1, tile2) {
				require(['app/gameboard'], function(GameBoard) {
					var r1 = tile1.options.row, c1 = tile1.options.column;
					GameBoard.tiles[tile1.options.column][tile1.options.row] = tile2;
					GameBoard.tiles[tile2.options.column][tile2.options.row] = tile1;
					tile1.options.row = tile2.options.row;
					tile1.options.column = tile2.options.column;
					tile2.options.row = r1;
					tile2.options.column = c1;
					
					// Check for matches
					var matches = GameBoard.checkMatches(tile1);
					matches = matches.concat(GameBoard.checkMatches(tile2));
					
					if(matches.length > 0) {
						GameBoard.removeTiles(matches);
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
		}
	};
});
