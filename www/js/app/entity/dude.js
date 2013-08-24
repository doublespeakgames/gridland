define(['app/entity/worldentity'], function(WorldEntity) {
	var dude = function() {};
	dude.prototype = new WorldEntity({
		className: 'dude'
	});
	dude.constructor = dude;
	
	dude.prototype.think = function() {
		if(Math.random() < 0.1) {
			var pos = Math.floor(Math.random() * 480);
			this.move(pos);
		}
	};
	
	return dude;
});