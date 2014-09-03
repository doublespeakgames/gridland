define(['app/entity/worldentity'], 
		function(WorldEntity) {
	
	var Star = function() { };
	Star.prototype = new WorldEntity({
		className: 'star',
		spriteName: 'star'
	});
	Star.constructor = Star;
	
	return Star;
});