define(['app/eventmanager', 'app/gamestate'], function(E, State) {
	
	var _el = null;
	function el() {
		var G = require('app/graphics/graphics');
		if(_el == null) {
			_el = G.make('volumeSlider').append(G.make('nightSprite'))
				.append(G.make('sliderTrack litBorder')).append(G.make('sliderHandle litBorder'));
			G.addToMenu(_el);
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