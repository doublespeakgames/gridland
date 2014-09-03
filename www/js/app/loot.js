define(['app/eventmanager', 'app/entity/loot/treasurechest', 'app/gamestate', 'app/gamecontent'], 
		function(E, TreasureChest, GameState, Content) {
	
	var BASE_DROP = 0.05;
	var TILE_DROP = 0.15;

	var probabilities = {
		rare: 0.10,
		uncommon: 0.35,
		common: 1
	};
	
	function rollForLoot(monster) {
		// %15 chance for normal monster, %15 for every tile after that.
		var chance = (monster.dropChance || BASE_DROP) * 3 + (monster.dropChance || TILE_DROP) * (monster.options.tiles - 3);
		var roll = Math.random();
		if(monster.forceLoot || roll < chance) {
			// Drop loot!
			var treasure = new TreasureChest({forceLoot: monster.getLoot()});
			treasure.p(monster.p());
			E.trigger('newEntity', [treasure]);
		}
	}
	
	function getLoot(treasure, debugMultiplier) {
		var lootName = null;
		var gemDropRate = 0.05;
		if(GameState.dayNumber > (20 / debugMultiplier)) gemDropRate *= 2;
		if(GameState.dayNumber > (40 / debugMultiplier)) gemDropRate *= 2;
		if(treasure.options.forceLoot) {
			lootName = treasure.options.forceLoot;
		} else if(GameState.gem < 4 && Math.random() < gemDropRate * debugMultiplier) {
			lootName = "shard";
		} else {
			var r = Math.random();
			var lootPool = null;
			for(var rarity in probabilities) {
				if(r < probabilities[rarity]) {
					lootPool = Content.lootPools[rarity];
					break;
				}
			}
			var poolSize = 0;
			for(poolSize in lootPool) {}
			poolSize++; // Correct for array 0-indexing
			
			r = Math.random();
			for(i in lootPool) {
				lootName = lootPool[i];
				if(r < (i + 1) / poolSize) {
					break;
				}
			}
		}
		
		E.trigger("lootGained", [lootName, treasure]);
		if(lootName == "shard") {
			// Shards are special. Maybe abstract this later...
			var num = GameState.gem || 0;
			GameState.gem = ++num > 4 ? 4 : num;
			E.trigger("updateGem");
		} else {
			GameState.count('LOOT', 1);
			var num = GameState.items[lootName] || 0;
			num++;
			var max = Content.LootType[lootName].large ? 1 : 3;
			num = num < max ? num : max;
			GameState.items[lootName] = num;
			E.trigger("lootFound", [lootName, num]);
		}

		treasure.gone = true;
	}
	
	return {
		init: function() {
			E.bind("monsterKilled", rollForLoot, this);
			E.bind("pickupLoot", getLoot, this);
		},
		
		useItem: function(lootName) {
			var num = GameState.items[lootName];
			if(num > 0 && require('app/world').canMove()) {
				num--;
				GameState.items[lootName] = num;
				E.trigger('lootUsed', [lootName, num]);
				Content.LootType[lootName].onUse();
			}
		}
	};
});