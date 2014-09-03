define(['app/entity/worldentity'], function(WorldEntity) {
	
	var TreasureChest = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		this.lootable = true;
	};
	TreasureChest.prototype = new WorldEntity({
		className: 'treasureChest nightSprite',
		spriteName: 'treasurechest',
		animationFrames: 0
	});
	TreasureChest.constructor = TreasureChest;
	
	return TreasureChest;
});