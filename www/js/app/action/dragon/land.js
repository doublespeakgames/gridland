define(['app/action/action'], function(Action) {
	
	var Land = function() {};
	Land.prototype = new Action();
	Land.constructor = Land;
	
	Land.prototype.doAction = function(entity) {
		entity.hostile = false;
		require('app/graphics/graphics').landDragon(entity, function() {
			entity.hostile = true;
			entity.action = null;
		});
	};

	return Land;
});