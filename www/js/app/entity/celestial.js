define(['app/entity/worldentity'], 
		function(WorldEntity) {
	
	var celestial = function() { };
	celestial.prototype = new WorldEntity({
		className: 'celestial',
		spriteName: 'sun'
	});
	celestial.constructor = celestial;
	
	return celestial;
});