define(['app/entity/entity'], function(Entity) {
	var dude = function() {
		this.animationFrames = 4;
		this.className = "dude";
		
		this.think = function() {
			if(Math.random() < 0.1) {
				var pos = Math.floor(Math.random() * 480);
				this.move(pos);
			}
		};
	};
	dude.prototype = new Entity();
	dude.constructor = dude;
	
	return dude;
});