define(['app/eventmanager', 'app/entity/loot/treasurechest'], function(E, TreasureChest) {
	
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
	
	return {
		init: function() {
			E.bind("monsterKilled", rollForLoot, this);
		}
	};
});