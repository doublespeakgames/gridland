define(['app/graphics/graphics', 'app/eventmanager'], function(G, EventManager) {
	
	var _el = null;
	function el() {
		if(_el == null) {
			_el = G.make('inventory litBorder');
		}
		return _el;
	}
	
	return {
		init: function() {
			G.addToBoard(el());
		}
	};
});