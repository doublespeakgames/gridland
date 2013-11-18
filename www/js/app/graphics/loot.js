define(['app/graphics/graphics', 'app/eventmanager', 'app/gamestate'], function(G, E, State) {
	
	function openChest(chest) {
		chest.animation(1);
	}
	
	function drawLoot(loot, entity) {
		var lootIcon = G.make('loot ' + loot);
		G.setPosition(lootIcon, entity.p());
		G.addToWorld(lootIcon);
		setTimeout(function() {
			G.remove(lootIcon);
		}, 2000);
	}
	
	function updateLootButton(loot, num) {
		var btn = G.get("." + loot, el());
		if(btn == null) {
			btn = G.make("hidden itemButton " + loot)
				.append(G.make())
				.append(G.make()).append(G.make()).append(G.make())
				.data('lootName', loot)
				.appendTo(el());
		}
		btn.removeClass('charge_0 charge_1 charge_2 charge_3').addClass('charge_' + num);
		btn.removeClass('hidden');
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
			E.bind('pickupLoot', openChest);
			E.bind('lootGained', drawLoot);
			E.bind('updateLoot', updateLootButton);
			
			for(var lootName in State.items) {
				updateLootButton(lootName, State.items[lootName]);
			}
		}
	};
});