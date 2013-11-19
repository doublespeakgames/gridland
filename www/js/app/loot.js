define(['app/eventmanager', 'app/entity/loot/treasurechest', 'app/gamestate', 'app/gamecontent'], 
		function(E, TreasureChest, GameState, Content) {
	
	function rollForLoot(Monster) {
		// %30 chance for normal monster, %10 for every tile after that.
		var chance = Monster.options.tiles * 0.1;
		console.log("drop chance " + chance);
		if(Math.random() < chance) {
			// Drop loot!
			var treasure = new TreasureChest();
			treasure.p(Monster.p());
			E.trigger('newEntity', [treasure]);
		}
	}
	
	function getLoot(entity) {
		var r = Math.random();
		var loot = "healthPotion";
		if(r < 0.2) {
			loot = "bomb";
		} else if(r < 0.5) {
			loot = "equipment";
		}
		
		E.trigger("lootGained", [loot, entity]);
		var num = GameState.items[loot] || 0;
		num++;
		num = num < 3 ? num : 3;
		GameState.items[loot] = num;
		E.trigger("updateLoot", [loot, num]);
	}
	
	return {
		init: function() {
			E.bind("monsterKilled", rollForLoot, this);
			E.bind("pickupLoot", getLoot, this);
		},
		
		useItem: function(lootName) {
			var num = GameState.items[lootName];
			if(num > 0) {
				num--;
				GameState.items[lootName] = num;
				E.trigger('updateLoot', [lootName, num]);
				Content.LootType[lootName].onUse();
			}
		}
	};
});