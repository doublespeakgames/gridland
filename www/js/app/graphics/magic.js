	define(['app/eventmanager', 'app/gamestate'], function(E, State) {
	
	var MANA_COST = 3;
		
	var _el = null;
	var _open = false;
	function el() {
		var G = require('app/graphics/graphics');
		if(_el == null) {
			_el = G.make('hidden magic')
				.append(G.make('button litBorder').append(G.make()));
			updateMana(State.mana, State.maxMana());
			G.addToBoard(_el);
			setTimeout(function() {
				_el.removeClass('hidden');
			}, 100);
		}
		return _el;
	}
	
	function updateMana(current, total) {
		var percent = Math.ceil((current / total) * 100);
		el().find('.button > div').css('height', percent + '%');
	}
	
	function toggleMenu(button) {
		var open = false;
		if(_open) {
			open = button ? button.hasClass('open') : false;
			var G = require('app/graphics/graphics');
			G.get('.button.open', null, true).removeClass('open');
			_open = false;
		}
		
		if(button && !open && State.mana >= MANA_COST) {
			button.addClass('open');
			_open = true;
		}
	}
	
	function closeMenu() {
		var G = require('app/graphics/graphics');
		G.get('.button.open').removeClass('open');
	}
	
	return {
		init: function() {
			_el = null;
			E.bind("updateMana", updateMana);
			E.bind("toggleMenu", toggleMenu);
			E.bind("enableMagic", function() {
				el(); // Trigger graphics initialization
			});
		}
	};
});