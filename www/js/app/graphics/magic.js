define(['app/eventmanager', 'app/gamestate'], function(E, State) {
	
	var MANA_COST = 3;
		
	var _el = null;
	var _open = false;
	var _spells = null;
	var _states = null;
	
	function el() {
		if(_el == null) {
			var G = require('app/graphics/graphics');
			_el = G.make('hidden magic')
				.append(G.make('button litBorder').append(G.make('inner').append(G.make())));
			updateMana(State.mana, State.maxMana());
			G.addToBoard(_el);
			setTimeout(function() {
				_el.removeClass('hidden');
			}, 100);
		}
		return _el;
	}
	
	function spells() {
		if(_spells == null) {
			var G = require('app/graphics/graphics'),
				C = require('app/gamecontent');
			_spells = G.make('spells');
			for(var spell in C.Spells) {
				_spells.append(G.make(spell + ' litBorder spell').data('spellName', spell));
			}
		}
		return _spells;
	}
	
	function states() {
		if(_states == null) {
			var G = require('app/graphics/graphics');
			_states = G.make('states');
			G.addToBoard(_states);
		}
		return _states;
	}
	
	function updateMana(current, total) {
		var percent = Math.ceil((current / total) * 100);
		if(current == total) {
			el().find('.button').addClass('full');
		} else {
			el().find('.button').removeClass('full');
		}
		el().find('.button > .inner > div').css('height', percent + '%');
	}
	
	function handleClick(thing) {

		var spell = thing.closest('.spell');
		if(spell.length > 0 ) {
			if(!_open) return true;
			// cast a spell
			E.trigger('castSpell', [spell.data('spellName')]);
		}
		
		// toggle the menu
		toggleMenu(thing.closest('.button'));
	}
	
	function toggleMenu(button) {
		var open = false;
		if(_open) {
			open = button ? button.hasClass('open') : false;
			var G = require('app/graphics/graphics');
			G.get('.button.open', null, true).removeClass('open');
			setTimeout(spells().detach.bind(spells()), 200);
			_open = false;
		}
		
		if(button && !open && State.mana >= MANA_COST) {
			button.append(spells());
			spells().css('left'); // redraw
			button.addClass('open');
			_open = true;
		}
	}
	
	function closeMenu() {
		var G = require('app/graphics/graphics');
		G.get('.button.open').removeClass('open');
	}
	
	function drawStateEffect(effect) {
		var G = require('app/graphics/graphics');
		var state = states().find('.' + effect.className);
		state.remove();
		state = G.make(effect.className).appendTo(states());
		
		setTimeout(function() {
			state.addClass('expiring');
		}, effect.duration - 3000);
		
		setTimeout(function() {
			state.remove();
		}, effect.duration);
	}
	
	function removeStateEffect(effect) {
		states().find('.' + effect.className).remove();
	}
	
	return {
		init: function() {
			_el = null, _spells = null, _states = null;
			E.bind("updateMana", updateMana);
			E.bind("magicClick", handleClick);
			E.bind("toggleMenu", toggleMenu);
			E.bind("newStateEffect", drawStateEffect);
			E.bind("endStateEffect", removeStateEffect);
			E.bind("enableMagic", function() {
				el(); // Trigger graphics initialization
			});
		}
	};
});