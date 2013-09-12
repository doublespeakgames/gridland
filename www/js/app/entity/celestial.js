define(['app/entity/worldentity', 'app/world', 'app/graphics', 'app/gamestate'], 
		function(WorldEntity, World, Graphics, State) {
	
	var celestial = function() { };
	celestial.prototype = new WorldEntity({
		className: 'celestial'
	});
	celestial.constructor = celestial;
	
	return celestial;
});