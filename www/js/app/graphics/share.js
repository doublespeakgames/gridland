define(function() {
	
	var SITE_URL = encodeURIComponent("http://gridland.doublespeakgames.com");
	var links = [
		{
			className: 'twitter',
			url: 'https://twitter.com/intent/tweet?text=Match.%20Build.%20Survive.&url=' + SITE_URL,
			name: 'Twitter'
		}, {
			className: 'facebook',
			url: 'https://www.facebook.com/sharer/sharer.php?u=' + SITE_URL,
			name: 'Facebook'
		}, {
			className: 'reddit',
			url: 'http://www.reddit.com/submit?url=' + SITE_URL,
			name: 'Reddit'
		}, {
			className: 'gplus',
			url: 'https://plus.google.com/share?url=' + SITE_URL,
			name: 'Google+'
		}, {
			className: 'tumblr',
			url: 'https://www.tumblr.com/share/link?url=' + SITE_URL,
			name: 'Tumblr'
		}, {
			className: 'stumbleupon',
			url: 'https://www.stumbleupon.com/submit?url=' + SITE_URL,
			name: 'StumbleUpon'
		}
	];
	
	var _el = null;
	function el() {
		var G = require('app/graphics/graphics');
		if(_el == null) {
			G.addStyleRule('.social:before', 'content:"- ' + G.getText('SHARE') + ' -";');
			_el = G.make('social submenu', 'ul');
			links.forEach(function(link) {
				var l = G.make('litBorder', 'li').appendTo(_el);
				G.make(link.className).appendTo(l);
				G.make(link.className + ' nightSprite', 'a').attr({
					href: link.url,
					target: '_blank',
					title: link.name
				}).click(function() {
					require('app/eventmanager').trigger('click', [link.className]);
				}).appendTo(l);
			});
		}
		
		return _el;
	}
	
	return {
		init: function() {
			var G = require('app/graphics/graphics');
			G.addToMenu(el());
		}
	};
});