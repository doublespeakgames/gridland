define(['app/entity/worldentity'], 
		function(WorldEntity) {
	
	var Gem = function() { };
	Gem.prototype = new WorldEntity({
		className: 'gem',
		spriteName: 'gem'
	});
	Gem.constructor = Gem;
	
	return Gem;
});