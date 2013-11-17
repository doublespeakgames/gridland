define(['app/action/action', 'app/graphics/graphics'], function(Action, Graphics) {
	
	var Shoot = function(options) {
		if(options) {
			this.target = options.target;
		}
		this.arrow = null;
	};
	Shoot.prototype = new Action();
	Shoot.constructor = Shoot;
	
	Shoot.prototype.doAction = function(entity) {
		this._entity = entity;
		var animation;
		if(entity.p() < this.target.p()) {
			animation = 3;
			this.lastDir = "right";
		} else {
			animation = 4;
			this.lastDir = "left";
		}
		entity.animationOnce(animation);
	};
	
	Shoot.prototype.doFrameAction = function(frame) {
		if(frame == 3) {
			var start = this._entity.p();
			var end = this.target.p();
			var _action = this;
			this.arrow = Graphics.fireArrow(this._entity.options.arrowClass, 
					this._entity.options.arrowSpeed, start, end, function() {
				// Check for hit, deal damage
				if(Math.abs(end - _action.target.p()) <= 5) {
					_action.target.takeDamage(_action._entity.getDamage());
				}
			});
			this._entity.action = null;
		}
	};
	
	return Shoot;
});