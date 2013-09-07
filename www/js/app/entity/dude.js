define(['app/entity/worldentity', 'app/world', 'app/graphics'], function(WorldEntity, World, Graphics) {
	var dude = function() {
		this.carrying = null;
	};
	dude.prototype = new WorldEntity({
		className: 'dude'
	});
	dude.constructor = dude;
	
	dude.prototype.el = function() {
		if(this._el == null) {
			this._el = WorldEntity.prototype.el.call(this).append(Graphics.newElement("heldBlock"));
		}
		return this._el;
	};
	
	dude.prototype.think = function() {
		if(this.isIdle()) {
			var activity = World.getActivity();
			if(activity != null) {
				activity(this);
			}
		}
	};
	
	dude.prototype.animate = function() {
		if(this.carrying != null && this.animationRow == 1) {
			this.animationRow = 5;
		}
		WorldEntity.prototype.animate.call(this);
		if(this.carrying != null) {
			if(this.frame == 1) {
				this.carrying.css('top', '1px');
			} else if(this.frame == 3) {
				this.carrying.css('top', '-1px');
			} else {
				this.carrying.css('top', '0px');
			}
			this.carrying.top
		}
	};
	
	return dude;
});