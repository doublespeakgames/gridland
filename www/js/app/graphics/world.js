define(['app/eventmanager'], function(E) {
	
	var _el = null;
	function el() {
		var G = require('app/graphics/graphics');
		if(_el == null) {
			_el = G.make('world');
			G.addToBoard(_el);
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
		},
		
		add: function(thing) {
			el().append(thing);
		},
		
		remove: function(thing) {
			thing.remove();
		}
	};
});