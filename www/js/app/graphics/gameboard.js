define(['app/eventmanager', 'app/gameboard', 'app/entity/tile', 'app/gamecontent', 'app/gameoptions'], 
		function(E, GameBoard, Tile, Content, Options) {
	
	var G = null;
	var _el = null;
	var tileContainer = null;
	var tiles = [];
	var TILE_WIDTH = 0, TILE_HEIGHT = 0;
	var BOARD_PAD = 2;
	
	function el() {
		if (_el == null) {
			clearBoard();
			_el = createBoard(GameBoard.options.rows, GameBoard.options.columns);
			G.addToScreen(_el);
		}
		return _el;
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
	
	function drawBoardClear() {
		G.get('.tile', null, true).addClass('hidden');
		return 200;
	}
	
	function drawFillBoard(tileString) {
		console.log('filling');
		var tiles = tileString.split('');
		var col = 0, row = 0;
		for(var i = 0, len = tiles.length; i < len; i++) {
			var tileChar = tiles[i];
			if(tileChar == GameBoard.SEP) {
				col++;
				row = 0;
			} else {
				var tile = new Tile({
					type: Content.getResourceType(tileChar),
					row: row,
					column: col
				});
				setPositionInBoard(tile, tile.options.row, tile.options.column);
				tileContainer.append(tile.el());
				row++;
			}
		}
		return 0;
	}
	
	function setPositionInBoard(entity, row, column) {
		var el = entity.el();
		var top = row * TILE_HEIGHT + BOARD_PAD;
		var left = column * TILE_WIDTH + BOARD_PAD;
		el.css({
			transform: 'translate3d(' + left + 'px, ' + top + 'px, 0)',
			left: entity._leftPos,
		});
		
		// Force a redraw so our CSS animations don't skip
		// TODO: Do this in a lighter way. It's slowing down mobile pretty bad.
		el.css('left');
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
			}
		}
	};
});