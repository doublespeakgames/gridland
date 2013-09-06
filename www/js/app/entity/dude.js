define(['app/entity/worldentity', 'app/world'], function(WorldEntity, World) {
	var dude = function() {
		this.doing = null;
	};
	dude.prototype = new WorldEntity({
		className: 'dude'
	});
	dude.constructor = dude;
	
	dude.prototype.think = function() {
		if(this.isIdle()) {
			var activity = World.getActivity();
			if(activity != null) {
				activity(this);
			}
		}
	};
	
	dude.prototype.isIdle = function() {
		return this.tempAnimation == null && this.animationRow == 0;
	};
	
	return dude;
});