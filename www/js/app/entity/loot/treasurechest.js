define(['app/entity/worldEntity'], function(WorldEntity) {
	
	var TreasureChest = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		this.lootable = true;
	};
	TreasureChest.prototype = new WorldEntity({
		className: 'treasureChest',
		animationFrames: 0
	});
	TreasureChest.constructor = TreasureChest;
	
	return TreasureChest;
});