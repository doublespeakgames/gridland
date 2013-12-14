define(['jquery', 'app/eventmanager', 'app/entity/tile', 
        'app/resources', 'app/gamecontent', 'app/gamestate'], 
		function($, EventManager, Tile, Resources, Content, State) {
	
	var dropCount = 0;
	var removals = 0;
	var checkQueue = [];
	var tileString = '';
	var rowString = '';
	var filling = false;
	var totals = {};
	var swapSide = null;
	var detectMatches = null;
	
	var GameBoard = {
		SEP: 'X',
		options : {
			rows : 8,
			columns : 8
		},
		init : function(opts) {
			$.extend(this.options, opts);
			_el = null;
			Resources.loaded = false;
			filling = false;
			tileString = '';
			totals = {};
			
			detectMatches = new RegExp("([^" + GameBoard.SEP + "])\\1{2,}", "g");
			
			EventManager.bind("refreshBoard", refreshBoard);
		},
		
		switchTiles: function(pos1, pos2, skipMatch) {
			
			console.log(tileString);
			
			var char1 = getTile(pos1.row, pos1.col),
				char2 = getTile(pos2.row, pos2.col);
			setTile(pos1.row, pos1.col, char2);
			setTile(pos2.row, pos2.col, char1);
			
			console.log(tileString);
			
			require('app/engine').setGraphicsCallback(checkMatches);
			EventManager.trigger('draw', ['board.swap', {
				pos1: pos1,
				pos2: pos2
			}]);
		},
		
		canMove: function() {
			return dropCount == 0 && removals == 0;
		}
	};
	
	function tileMap() {
		var map = {
			'g' : 2,
			'w' : 2,
			's' : 2
		};

		if(State.hasBuilding(Content.BuildingType.BrickLayer)) {
			map.c = 2;
		}
		if(State.hasBuilding(Content.BuildingType.Weaver)) {
			map.l = 2;
		}
		
		return map;
	}
	
	function fill() {
		var start = Date.now();
		for(var col = 0, numCols = GameBoard.options.columns; col < numCols; col++) {
			for(var row = 0, numRows = GameBoard.options.rows; row < numRows; row++) {
				
				// console.log('[' + row + ', ' + col + ']');
		
				// Pieces to the left and the top could potentially be present
				var pCounts = tileMap();
				if (col > 0) {
					var sibling = getTile(row, col - 1);
					pCounts[sibling]--;
					if (col > 1 && getTile(row, col - 2) == sibling) {
						// console.log('horizontal detection: ' + sibling.options.type.className + ' == ' + GameBoard.tiles[col - 2][row].options.type.className);
						pCounts[sibling]--;
					}
				}
				if (row > 0) {
					var sibling = getTile(row - 1, col);
					pCounts[sibling]--;
					if (row > 1 && getTile(row - 2, col) == sibling) {
						// console.log('vertical detection: ' + sibling.options.type.className + ' == ' + GameBoard.tiles[col][row + 2].options.type.className);
						pCounts[sibling]--;
					}
				}
				var total = 0;
				for (tileChar in pCounts) {
					pCounts[tileChar] = pCounts[tileChar] < 0 ? 0 : pCounts[tileChar];
					total += pCounts[tileChar];
				}
		
				var baseline = 0;
				var r = Math.random();
				var theChar = "";
				for (tileChar in pCounts) {
					theChar = tileChar;
					var chance = pCounts[tileChar] / total;
					// console.log(tileClass + ': ' + r + ' < ' + baseline + ' + ' + pCounts[tileClass]  + ' / ' + total  + ' (' + chance + ')');
					if (r < baseline + chance) {
						break;
					}
					baseline += chance;
				}
				
				tileString += theChar;
			}
			
			tileString += GameBoard.SEP;
		}
		console.log("Generated board in " + (Date.now() - start) + "ms");
		require('app/engine').setGraphicsCallback(function(){});
		EventManager.trigger("draw", ['board.fill', tileString]);
	}
	
//	function addTiles(tilesToAdd) {
//		var G = require('app/graphics/graphics');
//		G.addTilesToContainer(tilesToAdd);
//		for(var t in tilesToAdd) {
//			var tile = tilesToAdd[t];
//			tile.el().removeClass('hidden');
//			G.setPositionInBoard(tile, tile.options.row, tile.options.column);
//		}
//		return tilesToAdd;
//	}
//	
//	function dropTiles(tilestoDrop) {
//		var G = require('app/graphics/graphics');
//		dropCount++;
//		for(var t in tilestoDrop) {
//			var tile = tilestoDrop[t];
//			if($.inArray(tile, checkQueue) == -1) {
//				checkQueue.push(tile);
//			}
//			var col = tiles[tile.options.column];
//			var finalRow = tile.options.row;
//			while (finalRow < GameBoard.options.rows - 1 && col[finalRow + 1] == null) {
//				finalRow++;
//			}
//			// Don't drop the tile if the column is full
//			if (finalRow < 0) {
//				throw "Cannot drop tile in full columns, idiot!";
//			}
//			if(tile.options.row >= 0) {
//				tiles[tile.options.column][tile.options.row] = null;
//			}
//			tiles[tile.options.column][finalRow] = tile;
//			tile.options.row = finalRow;
//		}
//		
//		G.dropTiles(tilestoDrop, function() {
//			dropCount--;
//			if(dropCount == 0) {
//				var matches = [];
//				while(checkQueue.length > 0) {
//					var curMatches = checkMatches(checkQueue.pop());
//					for(var m in curMatches) {
//						var match = curMatches[m];
//						if($.inArray(match, matches) == -1) {
//							matches.push(match);
//						}
//					}
//				}
//				if(matches.length > 0) {
//					handleMatches(matches);
//				} else if(!areMovesAvailable()) {
//					noMoreMoves();
//				} else if(!filling) {
//					EventManager.trigger('tilesSwapped');
//				} else if(filling) {
//					filling = false;
//				}
//			}
//		});
//	}
	
	function noMoreMoves() {
		// Refresh the board and incur penalties
		refreshBoard();
		EventManager.trigger('noMoreMoves');
	}
	
	function refreshBoard() {
		tileString = "";
		require('app/engine').setGraphicsCallback(fill);
		EventManager.trigger("draw", ['board.clear', {}]);
	}
	
	// TODO: Make this function less huge and ugly
	function handleMatches(matchedTiles) {
		var G = require('app/graphics/graphics');
		removals++;
		var tilesRemovedInColumn = {};
		var resourcesGained = {};

		// Remove matched tiles
		var resourceColumns = {};
		for(t in matchedTiles) {
			var tileToRemove = matchedTiles[t];
			var rList = resourceColumns[tileToRemove.options.type.className];
			if(!rList) {
				rList = resourceColumns[tileToRemove.options.type.className] = [];
			}
			rList.push(tileToRemove.options.column);
			var gained = resourcesGained[tileToRemove.options.type.className] || 0;
			resourcesGained[tileToRemove.options.type.className] = gained + 1;
			if(tiles[tileToRemove.options.column][tileToRemove.options.row] != null) {
				tiles[tileToRemove.options.column][tileToRemove.options.row] = null;
				if(tilesRemovedInColumn[tileToRemove.options.column] == null) {
					tilesRemovedInColumn[tileToRemove.options.column] = 0;
				}
				tilesRemovedInColumn[tileToRemove.options.column]++;
			}
			tileToRemove.options.row = -1;
		}
		
		// Check for matches of 4 or more
		var specialColumns = {};
		if(State.magicEnabled()) {
			for(var resource in resourceColumns) {
				var rCol = resourceColumns[resource];
				var num = resourcesGained[resource];
				if(num >= 4) {
					var cIndex = Math.floor(Math.random() * rCol.length);
					var selectedColumn = rCol[cIndex];
					var n = specialColumns[selectedColumn] || 0;
					specialColumns[selectedColumn] = n + 1;
				}
			}
		}
		
		EventManager.trigger('tilesCleared', [resourcesGained, swapSide]);
		
		G.removeTiles(matchedTiles, function() {
			// Drop remaining tiles
			var pCounts = tileMap();
			var nextCount = 0;
			for(i in pCounts) {
				nextCount += pCounts[i];
			}
			var newTiles = [];
			var dropList = [];
			for(col in tilesRemovedInColumn) {
				for(var r = GameBoard.options.rows - 1; r >= 0; r--) {
					if(tiles[col][r] != null) {
						dropList.push(tiles[col][r]);
					}
				}
				
				// Place mana tiles, if necessary
				var gemRows = {};
				if(State.magicEnabled()) {
					var gemsInColumn = specialColumns[col];
					if(gemsInColumn != null && gemsInColumn > 0) {
						var possibleRows = [];
						for(var i = 1, num = tilesRemovedInColumn[col]; i <= num; i++) {
							possibleRows.push(i);
						}
						for(var i = 0; i < gemsInColumn && possibleRows.length > 0; i++) {
							var rIndex = Math.floor(Math.random() * possibleRows.length);
							var row = possibleRows[rIndex];
							gemRows[row] = true;
						}
					}
				}
				
				for(var i = 1, num = tilesRemovedInColumn[col]; i <= num; i++) {
					var typeClass = "";
					if(gemRows[i]) {
						typeClass = "mana";
					} else {
						var probs = {};
						for(var p in pCounts) {
							probs[p] = pCounts[p] / nextCount;
						}
						var r = Math.random();
						var base = 0;
						for(var className in probs) {
							typeClass = className;
							var prob = probs[className];
//								console.log(className + ": " + r + " < " + prob + " + " + base);
							if(r < prob + base) {
								break;
							}
							base += prob;
						}
						
						var n = totals[typeClass] || 0;
						totals[typeClass] = n + 1;
						
						nextCount = 0;
						for(var t in pCounts) {
							if(t == typeClass) {
								pCounts[t]--;
							} else {
								pCounts[t] = 2;
							}
							nextCount += pCounts[t];
						}
					}
					newTiles.push(new Tile({
						column: parseInt(col),
						row: -i,
						type: Content.getResourceType(typeClass)
					}));
				}
			}
			
			dropList = dropList.concat(newTiles);
			addTiles(newTiles);
			dropTiles(dropList);
			
			removals--;
			if(removals < 0) removals = 0;
		});
	}
	
	function checkMatches() {
		
		generateRowString();
		
		var vMask = makeMask(tileString), hMask = makeMask(tileString);
		var matchDetected = false;
		
		// Detect vertical matches
		tileString.replace(detectMatches, function(match, p1, offset, string) {
			matchDetected = true;
			for(var i = 0, l = match.length; i < l; i++) {
		        vMask[offset + i] = 1;
		    }
		});
		
		// Detect horizontal matches
		rowString.replace(detectMatches, function(match, p1, offset, string) {
			matchDetected = true;
			for(var i = 0, l = match.length; i < l; i++) {
		        hMask[indexFromRowString(offset + i)] = 1;
		    }
		});
		
		var toRemove = [];
		if(matchDetected) {
			console.log('match found');
			for(var i in vMask) {
				if(vMask[i] == 1 || hMask[i] == 1) {
					toRemove.push(getPosition(i));
				}
			}
			// TODO: Add a real callback
			require('app/engine').setGraphicsCallback(function() {});
			EventManager.trigger('draw', ['board.match', {
				removed: toRemove
			}]);
		}
		
		
		// TODO: Rewrite
//		var hMatches = [tile], vMatches = [tile];			
//		if(tile.options.column > 0) {
//			var testTile = tiles[tile.options.column - 1][tile.options.row];
//			while(testTile != null && testTile.options.type == tile.options.type) {
//				hMatches.push(testTile);
//				if(testTile.options.column == 0) break;
//				testTile = tiles[testTile.options.column - 1][testTile.options.row];
//			}
//		}
//		if(tile.options.column < GameBoard.options.columns - 1) {
//			var testTile = tiles[tile.options.column + 1][tile.options.row];
//			while(testTile != null && testTile.options.type == tile.options.type) {
//				hMatches.push(testTile);
//				if(testTile.options.column == GameBoard.options.columns - 1) break;
//				testTile = tiles[testTile.options.column + 1][testTile.options.row];
//			}
//		}
//		if(tile.options.row > 0) {
//			var testTile = tiles[tile.options.column][tile.options.row - 1];
//			while(testTile != null && testTile.options.type == tile.options.type) {
//				vMatches.push(testTile);
//				if(testTile.options.row == 0) break;
//				testTile = tiles[testTile.options.column][testTile.options.row - 1];
//			}
//		}
//		if(tile.options.row < GameBoard.options.rows - 1) {
//			var testTile = tiles[tile.options.column][tile.options.row + 1];
//			while(testTile != null && testTile.options.type == tile.options.type) {
//				vMatches.push(testTile);
//				if(testTile.options.row == GameBoard.options.rows - 1) break;
//				testTile = tiles[testTile.options.column][testTile.options.row + 1];
//			}
//		}
//
//		// Only return matches that form rows/columns of three or more
//		var matches = [];
//		if(hMatches.length >= 3) {
//			matches = matches.concat(hMatches);
//		}
//		if(vMatches.length >= 3) {
//			for(var t in vMatches) {
//				var tile = vMatches[t];
//				if($.inArray(tile, matches) == -1) {
//					matches.push(tile);
//				}
//			}
//		}
//
//		return matches;
	}
	
	function areMovesAvailable() {
		// scan rows
		for(var row = 0; row < GameBoard.options.rows; row++) {
			for(var center = 1; center < GameBoard.options.columns - 1; center++) {
				var frame = [
					tiles[center - 1][row],
					tiles[center][row],
					tiles[center + 1][row]
				];
				
				/* The three possible patterns are:
				 * xox, xxo, oxx
				 * No other patterns can result in a move
				 */
				if(frame[0] != null && frame[1] != null && frame[0].options.type == frame[1].options.type) {
					// xxo
					var type = frame[0].options.type;
					if(row < GameBoard.options.rows - 1 && tiles[center + 1][row + 1] != null &&
							tiles[center + 1][row + 1].options.type == type) {
						return true;	
					}
					if(row > 0 && tiles[center + 1][row - 1] && 
							tiles[center + 1][row - 1].options.type == type) {
						return true;
					}
					if(center < GameBoard.options.columns - 2 && tiles[center + 2][row] != null &&
							tiles[center + 2][row].options.type == type) {
						return true;
					}
				}
				if(frame[0] != null && frame[2] != null && frame[0].options.type == frame[2].options.type) {
					// xox
					var type = frame[0].options.type;
					if(row < GameBoard.options.rows - 1 && tiles[center][row + 1] != null &&
							tiles[center][row + 1].options.type == type) {
						return true;	
					}
					if(row > 0 && tiles[center][row - 1] != null &&
							tiles[center][row - 1].options.type == type) {
						return true;
					}
				}
				if(frame[1] != null && frame[2] != null && frame[1].options.type == frame[2].options.type) {
					// oxx
					var type = frame[1].options.type;
					if(row < GameBoard.options.rows - 1 && tiles[center - 1][row + 1] != null && 
							tiles[center - 1][row + 1].options.type == type) {
						return true;	
					}
					if(row > 0 && tiles[center - 1][row - 1] != null && 
							tiles[center - 1][row - 1].options.type == type) {
						return true;
					}
					if(center > 1 && tiles[center - 2][row] != null && 
							tiles[center - 2][row].options.type == type) {
						return true;
					}
				}
			}
		}
		// scan columns
		for(var column = 0; column < GameBoard.options.columns; column++) {
			for(var center = 1; center < GameBoard.options.rows - 1; center++) {
				var frame = [
					tiles[column][center - 1],
					tiles[column][center],
					tiles[column][center + 1]
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
					if(column < GameBoard.options.column - 1 && tiles[column + 1][center + 1] != null && 
							tiles[column + 1][center + 1].options.type == type) {
						return true;	
					}
					if(column > 0 && tiles[column - 1][center + 1] != null && 
							tiles[column - 1][center + 1].options.type == type) {
						return true;
					}
					if(center < GameBoard.options.rows - 2 && tiles[column][center + 2] != null && 
							tiles[column][center + 2].options.type == type) {
						return true;
					}
				}
				if(frame[0] != null && frame[2] != null && frame[0].options.type == frame[2].options.type) {
					/*  x
					 *  o
					 *  x
					 */
					var type = frame[0].options.type;
					if(column < GameBoard.options.columns - 1 && tiles[column + 1][center] != null && 
							tiles[column + 1][center].options.type == type) {
						return true;	
					}
					if(column > 0 && tiles[column - 1][center] != null && 
							tiles[column - 1][center].options.type == type) {
						return true;
					}
				}
				if(frame[1] != null && frame[2] != null && frame[1].options.type == frame[2].options.type) {
					/*  o
					 *  x
					 *  x
					 */
					var type = frame[1].options.type;
					if(column < GameBoard.options.column - 1 && tiles[column + 1][center - 1] != null && 
							tiles[column + 1][center - 1].options.type == type) {
						return true;	
					}
					if(column > 0 && tiles[column - 1][center - 1] != null && 
							tiles[column - 1][center - 1].options.type == type) {
						return true;
					}
					if(center > 1 && tiles[column][center - 2] != null && 
							tiles[column][center - 2].options.type == type) {
						return true;
					}
				}
			}
		}
		return false;
	}
	
	function getIndex(row, col) {
		// Tiles are defined in a single flat string in column-row order
		// Each column is terminated with a separator character
		return col * (GameBoard.options.rows + 1) + row;
	}
	
	function getPosition(index) {
		var c = index / (GameBoard.options.rows + 1);
		return {
			row: index % (GameBoard.options.rows + 1),
			col: c | c // Faster than Math.floor
		};
	}
	
	function getTile(row, col) {
		return tileString.charAt(getIndex(row, col));
	}
	
	function setTile(row, col, char) {
		var idx = getIndex(row, col);
		tileString = tileString.substring(0, idx) + char + tileString.substring(idx + 1);
	}
	
	function makeMask(s) {
	    var m = [];
	    for(var i = 0, len = s.length; i < len; i++) {
	        m.push(0);
	    }
	    return m;
	}
	
	function generateRowString() {
		rowString = '';
		for(var row = 0; row < GameBoard.options.rows; row++) {
			for(var col = 0; col < GameBoard.options.columns; col++) {
				rowString += getTile(row, col);
			}
			rowString += GameBoard.SEP;
		}
	}
	
	function indexFromRowString(idx) {
		var c = idx / (GameBoard.options.columns + 1);
		c = c|c;
		return (idx % (GameBoard.options.rows + 1))*(GameBoard.options.rows + 1) + c;
	}
	
	return GameBoard;
});
