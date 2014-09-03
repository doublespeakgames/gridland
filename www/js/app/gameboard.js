define(['jquery', 'app/eventmanager', 'app/entity/tile', 
        'app/resources', 'app/gamecontent', 'app/gamestate'], 
		function($, EventManager, Tile, Resources, Content, State) {
	
	var dropCount = 0;
	var removals = 0;
	var tileString = '';
	var rowString = '';
	var swapSide = null;
	var detectMatches = null;
	var areEffects = null;
	var findHoles = null;
	var lastSwitch = null;
	var effectString = null;
	var effectMap = {};
	var HOLE = 'O';
	var NO_EFFECT = '!';
	var moved = false;
	var locked = false;
	var chain = 0;
	var checkQueued = false;
	
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
			tileString = '';
			effectString = null;
			chain = 0;
			
			detectMatches = new RegExp("([^" + GameBoard.SEP + "])\\1{2,}", "g");
			findHoles = new RegExp(HOLE, "g");
			areEffects = new RegExp("[^" + NO_EFFECT + GameBoard.SEP + "]");
			
			EventManager.bind("refreshBoard", refreshBoard);
			EventManager.bind("createTileEffect", createEffect);
			EventManager.bind("tilesSwapped", expireEffects);
			EventManager.bind("afterUnpaused", function() {
				if(checkQueued) {
					checkMatches();
				}
			});
			
			window.tiles = function() {
				console.log(tileString);
				console.log(rowString);
			}
		},
		
		switchTiles: function(pos1, pos2) {
			var cb = checkMatches;
			if(!pos1 && !pos2 && lastSwitch) {
				// We are reverting a switch
				pos1 = lastSwitch.pos2;
				pos2 = lastSwitch.pos1;
				cb = function() {};
			}
			
			swapSide = pos1.col < GameBoard.options.columns / 2 ? 'left' : 'right';
			lastSwitch = {
				pos1: pos1,
				pos2: pos2
			};
			
			// Swap the tiles
			var char1 = getTile(pos1.row, pos1.col),
				char2 = getTile(pos2.row, pos2.col);
			setTile(pos1.row, pos1.col, char2);
			setTile(pos2.row, pos2.col, char1);
			
			// Swap effects, if present
			if(effectString) {
				var effect1 = getEffectTile(pos1.row, pos1.col),
					effect2 = getEffectTile(pos2.row, pos2.col);
				setEffectTile(pos1.row, pos1.col, effect2);
				setEffectTile(pos2.row, pos2.col, effect1);
			}
			
			moved = true;
			
			require('app/engine').setGraphicsCallback(cb);
			EventManager.trigger('draw', ['board.swap', {
				pos1: pos1,
				pos2: pos2
			}]);
		},
		
		addEffectRandomly: function(effectType) {
			var row = Math.random() * GameBoard.options.rows;
			var col = Math.random() * GameBoard.options.rows;
			
			createEffect(row|row, col|col, effectType);
		},
		
		canMove: function() {
			return dropCount == 0 && removals == 0 && !locked;
		},
		
		shouldDrawResourceEffect: function(resourceType) {
			return resourceType == Content.ResourceType.Grain || State.hasBase();
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
				
				tileString += generateTile(pCounts);
			}
			
			tileString += GameBoard.SEP;
		}
		require('app/engine').setGraphicsCallback(function(){});
		EventManager.trigger("draw", ['board.fill', tileString]);
	}
	
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
	
	function checkMatches() {

		if(require('app/engine').paused) {
			checkQueued = true;
			return;
		}

		checkQueued = false;
		generateRowString();
		
		var vMask = makeMask(tileString), hMask = makeMask(tileString);
		var matchDetected = false;
		
		var gemsInColumn = {};
		
		// Detect vertical matches
		tileString.replace(detectMatches, function(match, p1, offset, string) {
			matchDetected = true;
			if(match.length > 3) {
				var column = getColumn(offset);
				gemsInColumn[column] = gemsInColumn[column] ? gemsInColumn[column] + 1 : 1;
			}
			for(var i = 0, l = match.length; i < l; i++) {
		        vMask[offset + i] = 1;
		    }
		});
		
		// Detect horizontal matches
		rowString.replace(detectMatches, function(match, p1, offset, string) {
			matchDetected = true;
			if(match.length > 3) {
				var column = getColumn(offset + Math.floor(Math.random() * match.length), true);
				gemsInColumn[column] = gemsInColumn[column] ? gemsInColumn[column] + 1 : 1;
			}
			for(var i = 0, l = match.length; i < l; i++) {
		        hMask[indexFromRowString(offset + i)] = 1;
		    }
		});
		
		var toRemove = [];
		var newTiles = [];
		var resourcesGained = {};
		if(matchDetected) {
			chain++;
			if(lastSwitch) {
				State.count('SWAPPED', 1);
			}
			var perTile = {};
			for(var i = 0, len = vMask.length; i < len; i++) {
				if((vMask[i] == 1 || hMask[i] == 1) && getTile(i) != HOLE) {
					var type = Content.getResourceType(getTile(i));
					var c = type.className;
					resourcesGained[c] = resourcesGained[c] ? resourcesGained[c] + 1 : 1;
					perTile[i] = c;
					setTile(i, HOLE);
					toRemove.push({
						position: getPosition(i),
						type: type
					});
					// Remove entries in the effectString, if necessary
					if(effectString) {
						var effectChar = effectString.charAt(i);
						setEffectTile(i, HOLE);
						if(effectChar != NO_EFFECT) {
							var effect = effectMap[effectChar];
							effectMap[effectChar] = null;
							Content.getEffectType(effect.type).onMatch(getRow(i), getColumn(i)).forEach(function(tileMod) {
								var idx = getIndex(tileMod.row, tileMod.column);
								switch(tileMod.effect) {
								case 'remove':
									setTile(idx, HOLE);
									setEffectTile(idx, HOLE);
									var retro = perTile[idx];
									if(retro && retro != '-') {
										perTile[idx] = '-';
										resourcesGained[retro]--;
									} else if(!retro) {
										perTile[idx] = '-';
										toRemove.push({
											position: {
												row: tileMod.row,
												col: tileMod.column	
											},
											type: null
										});
									}
									break;
								// More effects later?
								}
							});
						}
					}
				}
			}
			
			// Remove holes and add new tiles
			var pCounts = tileMap();
			var total = getTotal(pCounts);
			tileString = tileString.replace(findHoles, '');
			var columns = tileString.split(GameBoard.SEP);
			var effectColumns = null;
			
			if(effectString) {
				effectString = effectString.replace(findHoles, '');
				effectColumns = effectString.split(GameBoard.SEP);
			}
			
			for(var colIndex = 0, len = columns.length - 1; colIndex < len; colIndex++) {
				var column = columns[colIndex];
				var needed = GameBoard.options.rows - column.length;
				if(needed > 0) {
					// Repopulate the column
					var numGems = !require('app/engine').isNight() && gemsInColumn[colIndex] && State.magicEnabled() ? 
							gemsInColumn[colIndex] : 0;
					var gemRows = {};
					if(numGems > 0) {
						// Determine where the gems will fall
						var possibleRows = [];
						for(var x = 0; x < numGems; x++){
							possibleRows.push(x);
						}
						while(numGems > 0 && possibleRows.length > 0) {
							var r = Math.random() * possibleRows.length;
							r = r|r;
							gemRows[possibleRows[r]] = true;
							possibleRows.splice(r, 1);
							numGems--;
						}
					}
					for(var rowIndex = needed - 1; rowIndex >= 0; rowIndex--) {
						var newChar;
						if(gemRows[rowIndex]) {
							newChar = 'm';
						} else {
							newChar = generateTile(pCounts, total);
						}
						column = newChar + column;
						newTiles.push({
							row: rowIndex,
							col: colIndex,
							char: newChar
						});
						
						if(effectString) {
							effectColumns[colIndex] = NO_EFFECT + effectColumns[colIndex];
						}
					}
					columns[colIndex] = column;
				}
			}
			tileString = columns.join(GameBoard.SEP);
			if(effectString) {
				effectString = effectColumns.join(GameBoard.SEP);
				checkEffectString();
			}
			lastSwitch = null;

			require('app/engine').setGraphicsCallback(checkMatches);
			EventManager.trigger('draw', ['board.match', {
				removed: toRemove,
				added: newTiles,
				isNight: require('app/engine').isNight(),
				side: swapSide
			}]);
			EventManager.trigger('tilesCleared', [resourcesGained, swapSide, moved]);
		} else {
			EventManager.trigger('tilesSwapped', [lastSwitch == null]);
			State.setIfHigher('CHAIN', chain);
			chain = 0;
			if(lastSwitch) {
				// Revert the switch
				GameBoard.switchTiles();
			} else if(!areMovesAvailable()) {
				noMoreMoves();
			}
		}
		moved = false;
	}
	
	function getIndex(row, col) {
		// Tiles are defined in a single flat string in column-row order
		// Each column is terminated with a separator character
		return col * (GameBoard.options.rows + 1) + row;
	}
	
	function getColumn(index, rowOriented) {
		if(rowOriented) {
			return index % (GameBoard.options.columns + 1);
		} else {
			var c = index / (GameBoard.options.rows + 1);
			return c|c; // Faster than Math.floor
		}
	}
	
	function getRow(index, rowOriented) {
		if(rowOriented) {
			var c = index / (GameBoard.options.columns + 1);
			return c|c; // Faster than Math.floor
		} else {
			return index % (GameBoard.options.rows + 1);
		}
	}
	
	function getPosition(index) {
		return {
			row: getRow(index),
			col: getColumn(index)
		};
	}
	
	function areMovesAvailable() {
		generateRowString();
		var match;

		// xxo + oxx
		var re = /(.?)([^X])\2(.)/g;
		while(match = re.exec(tileString)) {
			if(match[1] && match[1] != GameBoard.SEP && adjacentCount(match.index, match[2]) > 1) 
				return true;
			if(match[3] != GameBoard.SEP && adjacentCount(match.index + match[0].length - 1, match[2]) > 1) 
				return true;
		}
		while(match = re.exec(rowString)) {
			if(match[1] && match[1] != GameBoard.SEP && adjacentCount(indexFromRowString(match.index), match[2]) > 1) 
				return true;
			if(match[3] != GameBoard.SEP && adjacentCount(indexFromRowString(match.index + match[0].length - 1), 
					match[2]) > 1) 
				return true;
		}
		
		// xox
		re = /([^X])[^X]\1/g;
		while(match = re.exec(tileString)) {
			if(adjacentCount(match.index + 1, match[1]) > 2) return true;
		}
		while(match = re.exec(rowString)) {
			if(adjacentCount(indexFromRowString(match.index + 1), match[1]) > 2) return true;
		}

		return false;
	}
	
	function getAdjacentTiles(index) {
		return [index > 0 ? getTile(index - 1) : null, 
				index < tileString.length - 1 ? getTile(index + 1) : null, 
		        index > GameBoard.options.rows ? getTile(index - GameBoard.options.rows - 1) : null, 
		        index < tileString.length - GameBoard.options.rows - 2 ? getTile(index + GameBoard.options.rows + 1) : null];
	}
	
	function adjacentCount(index, char) {
		var count = 0;
		getAdjacentTiles(index).forEach(function(c) {
			if(c === char) count++;
		});
		return count;
	}
	
	function getTile(row, col) {
		if(col == null) {
			return tileString.charAt(row);
		}
		return tileString.charAt(getIndex(row, col));
	}
	
	function getEffectTile(row, col) {
		if(!effectString) return null;
		if(col == null) {
			return effectString.charAt(row);
		}
		return effectString.charAt(getIndex(row, col));
	}
	
	function setTile(p1, p2, p3) {
		// Either (row, column, character) or (index, character)
		var idx = p3 ? getIndex(p1, p2) : p1;
		var char = p3 ? p3 : p2;
		tileString = tileString.substring(0, idx) + char + tileString.substring(idx + 1);
	}
	
	function setEffectTile(p1, p2, p3) {
		// Create the effect string, if necessary
		if(effectString == null) {
			effectString = '';
			for(var c = 0, numCols = GameBoard.options.columns; c < numCols; c++) {
				for(var r = 0, numRows = GameBoard.options.rows; r < numRows; r++) {
					effectString += NO_EFFECT;
				}
				effectString += GameBoard.SEP;
			}
		}
		// Either (row, column, character) or (index, character)
		var idx = p3 ? getIndex(p1, p2) : p1;
		var char = p3 ? p3 : p2;
		effectString = effectString.substring(0, idx) + char + effectString.substring(idx + 1);
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
		return getIndex(getRow(idx, true), getColumn(idx, true));
	}
	
	function getTotal(pCounts) {
		total = 0;
		for (tileChar in pCounts) {
			pCounts[tileChar] = pCounts[tileChar] < 0 ? 0 : pCounts[tileChar];
			total += pCounts[tileChar];
		}
		return total;
	}
	
	function generateTile(pCounts, total) {
		if(total == null) {
			total = getTotal(pCounts);
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
		
		return theChar;
	}
	
	function nextEffectChar() {
		// valid numbers are from 34 to 255, excluding SEP
		for(var i = 34; i < 255; i++) {
			var effectChar = String.fromCharCode(i);
			if(effectChar == GameBoard.SEP) continue;
			if(effectMap[effectChar] == null) {
				return effectChar;
			}
		}
		throw "No effect characters available. Something's wrong!";
	}
	
	function createEffect(row, column, effectType) {
		
		var idx = getIndex(row, column);
		if(effectString && effectString.charAt(idx) != NO_EFFECT) {
			// There's already an effect here. I think we'll just let it slide.
			return;
		}
		
		// Create a new entry in the effect map
		var effectChar = nextEffectChar();
		effectMap[effectChar] = {
			type: effectType,
			duration: Content.getEffectType(effectType).duration
		};
		
		// Add the effect character to the effect string
		setEffectTile(row, column, effectChar);
		
		// Tell Graphics
		EventManager.trigger('drawEffect', [{
			row: row,
			column: column,
			effectType: effectType
		}]);
	}
	
	function expireEffects(matched) {
		if(matched && effectString) {
			// Update tile effect durations
			for(var e in effectMap) {
				var effect = effectMap[e];
				if(effect != null) {
					effect.duration--;
					if(effect.duration <= 0) {
						removeEffect(e);
					}
				}
			}
		}
	}
	
	function removeEffect(effectChar) {
		var idx = effectString.indexOf(effectChar);
		if(idx >= 0) {
			// Tell Graphics
			EventManager.trigger('drawRemoveEffect', [{
				row: getRow(idx),
				column: getColumn(idx),
				effectType: effectMap[effectChar].type
			}]);
			setEffectTile(idx, NO_EFFECT);
			effectMap[effectChar] = null;
			checkEffectString();
		}
	}
	
	function checkEffectString() {
		if(!areEffects.test(effectString)) {
			effectString = null;
		}
	}
	
	return GameBoard;
});
