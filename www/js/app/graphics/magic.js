define(['app/eventmanager', 'app/gamestate'], function(E, State) {
	
	var _el = null;
	function el() {
		var G = require('app/graphics/graphics');
		if(_el == null) {
			_el = G.make('hidden magic').append(G.make('manaBar litBorder').append(G.make()));
			G.addToBoard(_el);
			setTimeout(function() {
				_el.removeClass('hidden');
			}, 100);
		}
		return _el;
	}
	
	return {
		init: function() {
			_el = null;
			el();
		}
	};
});