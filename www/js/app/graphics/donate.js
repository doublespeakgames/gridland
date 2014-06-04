define(function() {
	
	var providers = [
		'<form method="post" target="_blank" action="https://www.paypal.com/cgi-bin/webscr">' +
			'<input type="hidden" value="_donations" name="cmd">' +
			'<input type="hidden" value="continuities@gmail.com" name="business">' +
			'<input type="hidden" value="Donation to doublespeak games" name="item_name">' +
			'<input type="hidden" value="0" name="rm">' +
			'<input type="hidden" value="CAD" name="currency_code">' +
	        '<input onclick="require(\'app/eventmanager\').trigger(\'click\', [\'paypal\']);" type="image" alt=" " title="PayPal" name="submit" class="paypal nightSprite">' +
	        '<input type="image" alt=" " class="paypal"></input>' + 
		'</form>',
		'<a  onclick="require(\'app/eventmanager\').trigger(\'click\', [\'flattr\']);" class="flattr nightSprite" title="Flattr" target="_blank" href="https://flattr.com/thing/1570114/doublespeak-games"></a>' + 
		'<input type="image" alt=" " class="flattr"></input>',
		'<div class="bitcoin">' +
			'<a onclick="require(\'app/eventmanager\').trigger(\'click\', [\'bitcoin\']);" href="bitcoin:151Ch7PwzMtiVEHMYth5F9REmySvxKJBDN" ' +
				'data-info="none" data-address="151Ch7PwzMtiVEHMYth5F9REmySvxKJBDN" ' +
				'class="bitcoin-button nightSprite" target="_blank"></a>' +
			'<input type="image" alt=" " class="bitcoin-button"></input>' + 
			'<div class="bitcoin-bubble">' +
				'<img width="200" height="200" alt="QR code" ' +
					'src="http://chart.googleapis.com/chart?chs=200x200&amp;cht=qr&amp;chld=H|0&amp;chl=bitcoin%3A151Ch7PwzMtiVEHMYth5F9REmySvxKJBDN">' +
				'151Ch7PwzMtiVEHMYth5F9REmySvxKJBDN' + 
			'</div>' +
		'</div>',
		'<a onclick="require(\'app/eventmanager\').trigger(\'click\', [\'gittip\']);" class="gittip nightSprite" title="Gittip" target="_blank" href="https://www.gittip.com/Continuities/"></a>' +
		'<input type="image" alt=" " class="gittip"></input>'
	];
	
	var _el = null;
	function el() {
		var G = require('app/graphics/graphics');
		if(_el == null) {
			G.addStyleRule('.donate:before', 'content:"- ' + G.getText('DONATE') + ' -";');
			_el = G.make('donate submenu', 'ul');
			providers.forEach(function(link) {
				G.make('litBorder', 'li').html(link).appendTo(_el);
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