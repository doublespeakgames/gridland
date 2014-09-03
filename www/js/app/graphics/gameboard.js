define(['app/eventmanager', 'app/gameboard', 'app/entity/tile', 'app/gamecontent', 'app/gameoptions'], 
		function(E, GameBoard, Tile, Content, Options) {
	
	var G = null;
	var _el = null;
	var tileContainer = null;
	var tiles = [];
	var TILE_WIDTH = 0, TILE_HEIGHT = 0;
	var BOARD_PAD = 2;
	var FILL_DELAY = 100;
	
	function el() {
		if (_el == null) {
			clearBoard();
			_el = createBoard(GameBoard.options.rows, GameBoard.options.columns);
			_el.addClass('hidden');
			G.addToGame(_el);
		}
		return _el;
	}
	
	function setTile(row, col, tile) {
		tiles[row] = tiles[row] || [];
		tiles[row][col] = tile;
	}
	
	function getTile(row, col) {
		return tiles[row][col];
	}
	
	function clearBoard() {
		$('.gameBoard').remove();
	}
	
	function createBoard(rows, cols) {
		// Generate the board element
		var el = G.make('gameBoard litBorder');
		if(GameBoard.options.mobile) {
			$('body').addClass('portrait');
		}
		tileContainer = G.make('tileContainer').attr('id', 'tileContainer').appendTo(el);
		// Determine the board dimensions based on the size of the tiles
		var testTile = G.make('tile').hide().appendTo('body');
		TILE_WIDTH = testTile.width();
		TILE_HEIGHT = testTile.height();
		el.width(TILE_WIDTH * cols);
		el.height(TILE_HEIGHT * rows);
		testTile.remove();
		return el;
	}
	
	function drawSwapTiles(opts) {
		var t1 = tiles[opts.pos1.row][opts.pos1.col];
		var t2 = tiles[opts.pos2.row][opts.pos2.col];
		tiles[opts.pos1.row][opts.pos1.col] = t2;
		tiles[opts.pos2.row][opts.pos2.col] = t1;
		t1.options.row = opts.pos2.row;
		t1.options.column = opts.pos2.col;
		t2.options.row = opts.pos1.row;
		t2.options.column = opts.pos1.col;
		updatePositionInBoard(t1);
		updatePositionInBoard(t2);
		
		return 200;
	}
	
	function drawBoardClear() {
		for(var row in tiles) {
			for(var col in tiles[row]) {
				removeTile(row, col);
			}
		}

		return 300;
	}
	
	function drawFillBoard(tileString) {
		var t = tileString.split('');
		var col = 0, row = 0;
		var mTime = (GameBoard.options.rows + GameBoard.options.columns) * FILL_DELAY;
		(function _f() {
			var tileChar = t.shift();
			if(tileChar == GameBoard.SEP) {
				col++;
				row = 0;
			} else {
				var tile = newTile(row, col, tileChar);
				setTimeout(function() {
					updatePositionInBoard(tile);
					setTimeout(function() {
						E.trigger('tileDrop');
					}, 100);
				}, 200 + mTime - ((row + (GameBoard.options.columns - col)) * FILL_DELAY));
				row++;
			}
			if(t.length > 0) {
				setTimeout(_f, 0);
			}
		})();
		return mTime + 200;
	}
	
	
	var effectPool = [];
	function getEffectEl(pos, type) {
		var e;
		if(effectPool.length == 0) {
			e = G.make('resourceEffect').appendTo(el());	
		} else {
			e = effectPool.pop();
		}
		var left = (pos.col * TILE_WIDTH) + (TILE_WIDTH / 2),
			top = (pos.row * TILE_HEIGHT) + (TILE_HEIGHT / 2);
		e.addClass(type.className).css({
			'transform': 'translate3d(' + left + 'px, ' + top + 'px, 0px) scale(1)',
			'-webkit-transform': 'translate3d(' + left + 'px, ' + top + 'px, 0px) scale(1)',
			'-moz-transform': 'translate3d(' + left + 'px, ' + top + 'px, 0px) scale(1)',
			'-ms-transform': 'translate3d(' + left + 'px, ' + top + 'px, 0px) scale(1)',
			'-o-transform': 'translate3d(' + left + 'px, ' + top + 'px, 0px) scale(1)'
		}).removeClass('pooled');
		return e;
	}
	
	function removeEffectEl(el) {
		el.attr('class', 'resourceEffect pooled');
		effectPool.push(el);
	}
	
	function drawMatchEffect(pos, type, isNight, side) {
		if(type != null && GameBoard.shouldDrawResourceEffect(type)) {
			// Create the effect at the tile position
			var e = getEffectEl(pos, type);
			// Move it to the destination
			e.css('left');
			var dest = type.effectDest[isNight ? 'night' : 'day'];
			if(dest == 'side') {
				dest = [ side == 'left' ? 0 : G.worldWidth(), -20];
			} else if(dest == 'sword') {
				dest = [-20, 28 * G.numHearts() + 14];
			}
			e.css({
				'transform': 'translate3d(' + dest[0] + 'px, ' + dest[1] + 'px, 0px) scale(0.2)', 
				'-webkit-transform': 'translate3d(' + dest[0] + 'px, ' + dest[1] + 'px, 0px) scale(0.2)',
				'-moz-transform': 'translate3d(' + dest[0] + 'px, ' + dest[1] + 'px, 0px) scale(0.2)',
				'-ms-transform': 'translate3d(' + dest[0] + 'px, ' + dest[1] + 'px, 0px) scale(0.2)',
				'-o-transform': 'translate3d(' + dest[0] + 'px, ' + dest[1] + 'px, 0px) scale(0.2)'
			});
			setTimeout(function() {
				removeEffectEl(e);
			}, 700);
		}
	}
	
	function drawMatch(opts) {
		var tilesToUpdate = [];
		// Remove matched tiles
		if(opts.removed) {
			for(var i in opts.removed) {
				var pos = opts.removed[i].position;
				removeTile(pos.row, pos.col);
				drawMatchEffect(pos, opts.removed[i].type, opts.isNight, opts.side);
				// Drop each tile above this tile one space
				for(var r = pos.row - 1; r >= 0; r--) {
					var t = getTile(r, pos.col);
					if(t) {
						t.options.row++;
						tilesToUpdate.push(t);
					}
				}
			}
		}
		
		// Add new tiles to the top
		if(opts.added) {
			for(var i in opts.added) {
				var a = opts.added[i];
				var tile = newTile(a.row, a.col, a.char);
				tilesToUpdate.push(tile);
			}
		}
		
		setTimeout(function() {
			// Drop tiles that need dropping
			for(var i in tilesToUpdate) {
				var t = tilesToUpdate[i];
				setTile(t.options.row, t.options.column, t);
				updatePositionInBoard(t);
			}
		}, 200);
		
		setTimeout(function() {
			E.trigger('tileDrop');
		}, 300);
		return 400;
	}
	
	function updatePositionInBoard(entity, row, column) {
		row = row || entity.options.row;
		column = column || entity.options.column;
		var el = entity.el();
		var p = getPosition(row, column);
		el.css({
			transform: 'translate3d(' + p.left + 'px, ' + p.top + 'px, 0)'
		});
	}
	
	function getPosition(row, column) {
		return {
			top: row * TILE_HEIGHT + BOARD_PAD,
			left: column * TILE_WIDTH + BOARD_PAD
		};
	}
	
	var tilePool = [];
	function preloadTiles() {
		// Preload the tiles necessary to fill the board, plus a buffer for matches.
		for(var i = 0; i < GameBoard.options.rows * GameBoard.options.columns * 2; i++) {
			var tile = new Tile({
				row: -1,
				column: 0,
				type: Content.ResourceType.Grain
			});

			tile.el().addClass('hidden pooled');
			updatePositionInBoard(tile, tile.options.row, tile.options.column);
			tileContainer.append(tile.el());
			tilePool.push(tile);
		}
	}
	function newTile(row, col, tileChar) {
		var tile;
		var opts = {
			type: Content.getResourceType(tileChar),
			row: row,
			column: col
		};
		if(tilePool.length == 0) {
			var tile = new Tile(opts);
			tileContainer.append(tile.el());
		} else {
			tile = tilePool.pop().repurpose(opts);
		}

		setTile(row, col, tile);
		updatePositionInBoard(tile, tile.options.row - GameBoard.options.rows, tile.options.column);
		
		return tile;
	}

	function removeTile(row, col) {
		var t = getTile(row, col);
		setTile(row, col, null);
		t.el().addClass('hidden');
		setTimeout(function() {
			t.el().addClass('pooled');
			updatePositionInBoard(t, -1);
			tilePool.push(t);
		}, 200);
	}
	
	function drawTileEffect(options) {
		var tile = getTile(options.row, options.column);
		tile && tile.el().addClass('effect_' + options.effectType);
	}
	
	function removeTileEffect(options) {
		var tile = getTile(options.row, options.column);
		tile && tile.el().removeClass('effect_' + options.effectType);
	}
	
	function explode(options) {
		var explosion = G.make('explosion');
		var p = getPosition(options.row, options.column);
		explosion.css({
			transform: 'translate3d(' + p.left + 'px, ' + p.top + 'px, 0)'
		});
		tileContainer.append(explosion);
		setTimeout(function() {
			explosion.remove();
		}, 400);
		explosion.show(function() {
			explosion.addClass('exploded');
		});
	}
	
	return {
		init: function() {
			G = require('app/graphics/graphics');
			tiles.length = 0;
			_el = null;
			el();
			preloadTiles();
			
			effectPool.length = 0;
			E.bind('drawEffect', drawTileEffect);
			E.bind('drawRemoveEffect', removeTileEffect);
			E.bind('tileExplode', explode);
			E.bind('gameLoaded', function() {
				el().removeClass('hidden');
			});
		},
		
		el: el,
		
		attachHandler: function(event, element, handler) {
			if(element) {
				el().on(event, element, handler);
			} else {
				el().on(event, handler);
			}
		},
		
		handleDrawRequest: function(requestString, options) {
			switch(requestString.toLowerCase()) {
				case 'clear':
					return drawBoardClear(options);
				case 'fill':
					return drawFillBoard(options);
				case 'swap':
					return drawSwapTiles(options);
				case 'match':
					return drawMatch(options);
			}
		},

		checkTilePool: function() {
			return tilePool.length;
		}
	};
});