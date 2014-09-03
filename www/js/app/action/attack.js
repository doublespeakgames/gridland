define(['app/action/action'], function(Action) {
	
	var Attack = function(options) {
		if(options) {
			this.target = options.target;
		}
	};
	Attack.prototype = new Action();
	Attack.constructor = Attack;
	
	Attack.prototype.doAction = function(entity) {
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
	
	Attack.prototype.doFrameAction = function(frame) {
		if(frame == 1) {
			require('app/eventmanager').trigger(this._entity.hasSword() ? 'sharpHit' : 'bluntHit');
			this.target.takeDamage(this._entity.getDamage(), this._entity);
		} else if(frame == 3) {
			this._entity.action = null;
		}
	};
	
	return Attack;
});