define(['app/eventmanager', 'app/gamestate'], function(E, State) {
	
	var _el = null;
	function el() {
		var G = require('app/graphics/graphics');
		if(_el == null) {
			_el = G.make('hidden magic')
				.append(G.make('manaBar litBorder').append(G.make()))
				.append(G.make('button litBorder'));
			G.addToBoard(_el);
			setTimeout(function() {
				_el.removeClass('hidden');
			}, 100);
		}
		return _el;
	}
	
	function updateMana(current, total) {
		var percent = Math.ceil((current / total) * 100);
		el().find('.manaBar > div').css('width', percent + '%');
	}
	
	return {
		init: function() {
			_el = null;
			E.bind("updateMana", updateMana);
		}
	};
});