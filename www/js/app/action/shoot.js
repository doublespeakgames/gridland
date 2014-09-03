define(['app/action/action', 'app/entity/projectile'], function(Action, Projectile) {
	
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
			require('app/eventmanager').trigger(this._entity.options.fire ? 'shootFire' : 'shoot');
			var Graphics = require('app/graphics/graphics');
			var start = this._entity.p();
			var end = this.target.p();
			var _action = this;
			var projectile = new Projectile({
				projectileClass: this._entity.options.arrowClass,
				speed: this._entity.options.arrowSpeed,
				fireFrom: start,
				fireTo: end
			});
			Graphics.fireArrow(projectile, function() {
				// Check for hit, deal damage
				if(Math.abs(end - _action.target.p()) <= 5) {
					require('app/eventmanager').trigger(_action._entity.options.fire ? 'explodeFire' :'sharpHit');
					_action.target.takeDamage(_action._entity.getDamage(), _action._entity);
				}
			});
			this._entity.action = null;
		}
	};
	
	return Shoot;
});