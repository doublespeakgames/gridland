define(['app/eventmanager', 'app/gameboard', 'app/entity/tile', 'app/gamecontent', 'app/gameoptions'], 
		function(E, GameBoard, Tile, Content, Options) {
	
	var G = null;
	var _el = null;
	var tileContainer = null;
	var tiles = [];
	var TILE_WIDTH = 0, TILE_HEIGHT = 0;
	var BOARD_PAD = 2;
	var FILL_DELAY = 50;
	
	function el() {
		if (_el == null) {
			clearBoard();
			_el = createBoard(GameBoard.options.rows, GameBoard.options.columns);
			G.addToScreen(_el);
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
		if(Options.get('showCosts')) {
			el.addClass('showCosts');
		};
		tileContainer = G.make('<div tileContainer').attr('id', 'tileContainer').appendTo(el);
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
		var t = G.get('.tile', null, true);
		t.addClass('hidden');
		setTimeout(function() {
			t.remove();
			tiles.length = 0;
		}, 200);
		return 200;
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
				var tile = new Tile({
					type: Content.getResourceType(tileChar),
					row: row,
					column: col
				});
				setTile(row, col, tile);
				updatePositionInBoard(tile, tile.options.row - GameBoard.options.rows);
				tileContainer.append(tile.el());
				setTimeout(function() {
					updatePositionInBoard(tile);
				}, mTime - ((row + (GameBoard.options.columns - col)) * FILL_DELAY));
				row++;
			}
			if(t.length > 0) {
				_f();
			}
		})();
		return mTime;
	}
	
	function drawMatch(opts) {
		// Add new tiles to the top
		// TODO
		
		// Remove matches tiles
		if(opts.removed) {
			for(var i in opts.removed) {
				var pos = opts.removed[i];
				getTile(pos.row, pos.col).el().addClass('hidden');
//				setTile(pos.row, pos.col, null);
			}
		}
			
		// Drop the new tiles
		// TODO
		
		return 200; // TODO: This will be longer
	}
	
	function updatePositionInBoard(entity, row, column) {
		row = row || entity.options.row;
		column = column || entity.options.column;
		var el = entity.el();
		var top = row * TILE_HEIGHT + BOARD_PAD;
		var left = column * TILE_WIDTH + BOARD_PAD;
		el.css({
			transform: 'translate3d(' + left + 'px, ' + top + 'px, 0)',
			left: entity._leftPos,
		});
		
		// Force a redraw so our CSS animations don't skip
		// TODO: Do this in a lighter way. It's slowing down mobile pretty bad.
//		el.css('left');
	}
	
	return {
		init: function() {
			G = require('app/graphics/graphics');
			tiles.length = 0;
			_el = null;
			el();
		},
		
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
		}
	};
});