define(function() {
	
	var providers = [
		'<form method="post" action="https://www.paypal.com/cgi-bin/webscr">' +
			'<input type="hidden" value="_donations" name="cmd">' +
			'<input type="hidden" value="continuities@gmail.com" name="business">' +
			'<input type="hidden" value="Donation to doublespeak games" name="item_name">' +
			'<input type="hidden" value="0" name="rm">' +
			'<input type="hidden" value="CAD" name="currency_code">' +
	        '<input type="image" alt="PayPal" name="submit" class="paypal">' +
		'</form>'
	];
	
	var _el = null;
	function el() {
		var G = require('app/graphics/graphics');
		if(_el == null) {
			G.addStyleRule('.donate:before', 'content:"- ' + G.getText('DONATE') + ' -";');
			_el = G.make('donate submenu', 'ul');
			providers.forEach(function(link) {
				
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