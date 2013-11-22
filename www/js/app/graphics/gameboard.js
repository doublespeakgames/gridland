define(['app/eventmanager', 'app/gameboard'], function(E, GameBoard) {
	
	var _el = null;
	function el() {
		var G = require('app/graphics/graphics');
		if (_el == null) {
			G.clearBoard();
			_el = G.createBoard(GameBoard.options.rows, GameBoard.options.columns);
			G.addToScreen(_el);
		}
		return _el;
	}
	
	return {
		init: function() {
			_el = null;
			el();
		},
		
		attachHandler: function(event, element, handler) {
			if(element) {
				el().on(event, element, handler);
			} else {
				el().on(event, handler);
			}
		}
	};
});