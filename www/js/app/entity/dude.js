define(['app/entity/entity'], function(Entity) {
	var dude = function() {
		this.animationFrames = 4;
		this.className = "dude";
	};
	dude.prototype = new Entity();
	dude.constructor = dude;
	
	return dude;
});