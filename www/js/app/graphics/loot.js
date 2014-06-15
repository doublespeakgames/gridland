define(['app/eventmanager', 'app/gamestate'], function(E, State) {
	
	var G = null;
	
	function openChest(chest) {
		chest.animation(1);
	}
	
	function drawLoot(loot, entity) {
		var lootIcon = G.make('loot ' + loot);
		G.addToWorld(lootIcon);
		G.setPosition(lootIcon, entity.p());
		setTimeout(function() {
			G.remove(lootIcon);
		}, 1500);
	}
	
	function updateLootButtons() {
		for(var lootName in State.items) {
			updateLootButton(lootName, State.items[lootName]);
		}
	}
	
	function updateLootButton(loot, num) {
		var btn = G.get("." + loot, el());
		if(btn == null) {
			btn = G.make("hidden button litBorder " + loot)
				.append(G.make())
				.data('lootName', loot)
				.appendTo(el())
				.append(G.make());
			if(!require('app/gamecontent').LootType[loot].large) {
				btn.append(G.make()).append(G.make());
			} else {
				btn.addClass('large');
			}
		}
		btn.removeClass('charge_0 charge_1 charge_2 charge_3').addClass('charge_' + num);
		btn.removeClass('hidden');
	}
	
	function drawLootEffect(loot) {
		if(loot == 'bomb') {
			var effect = G.make('bombsplosion').css('left', require('app/world').getDude().p());
			G.addToWorld(effect);
			setTimeout(function() {
				effect.remove();
			}, 790);
		}
	}
	
	var _el = null;
	function el() {
		if(_el == null) {
			_el = G.make('hidden inventory litBorder');
			G.addToBoard(_el);
			setTimeout(function() {
				_el.removeClass('hidden');
			}, 100);
		}
		return _el;
	}
	
	return {
		init: function() {
			_el = null;
			
			G = require('app/graphics/graphics');
			
			E.bind('pickupLoot', openChest);
			E.bind('lootGained', drawLoot);
			E.bind('lootFound', updateLootButton);
			E.bind('lootUsed', updateLootButton);
			E.bind('lootUsed', drawLootEffect);
			E.bind('gameLoaded', updateLootButtons);
			
			updateLootButtons();
		}
	};
});