define(function() {
	
	var providers = [

	];
	
	var _el = null;
	function el() {
		var G = require('app/graphics/graphics');
		if(_el == null) {
			G.addStyleRule('.donate:before', 'content:"- ' + G.getText('DONATE') + ' -";');
			_el = G.make('donate submenu', 'ul');
			providers.forEach(function(link) {
				// TODO
			});
		}
		
		return _el;
	}
	
	return {
		init: function() {
			require('app/graphics/graphics').addToMenu(el());
		}
	};
});