define(['app/entity/entity', 'app/graphics', 'app/action/actionfactory'], function(Entity, Graphics, ActionFactory) {
	
	var MOVE_ANIMS = {
		idle: 0,
		right: 1,
		left: 2,
		attackLeft: 3,
		attackRight: 4
	};
	
	var worldEntity = function(options) {
		this.options = $.extend({}, this.options, {
			// Nuthin'
		}, options);
		this.hp = this.maxHealth();
		this.gone = false;
	};
	worldEntity.prototype = new Entity();
	worldEntity.constructor = worldEntity;
	
	worldEntity.prototype.getAnimation = function(label) {
		return MOVE_ANIMS[label];
	};
	
	worldEntity.prototype.move = function(position, callback) {
		if(this.tempAnimation == null) {
			if(this.p() < position) {
				// Moving right
				this.animation(this.getAnimation("right"));
				this.lastDir = "right";
			} else if(this.p() > position) {
				// Moving left
				this.animation(this.getAnimation("left"));
				this.lastDir = "left";
			} else {
				// No movement required
				if(callback != null) {
					callback(this);
				}
				return;
			}
			var _entity = this;
			Graphics.animateMove(this, position, function() {
				// Stop the move animation
				_entity.animation(MOVE_ANIMS.idle);
				if(callback != null) {
					callback(_entity);
				}
			});
		}
	};
	
	worldEntity.prototype.moveTo = function(target, callback) {
		if(this.tempAnimation == null) {
			var position = target.p();
			if(this.p() < position) {
				// Moving right
				this.animation(this.getAnimation("right"));
				this.lastDir = "right";
			} else if(this.p() > position) {
				// Moving left
				this.animation(this.getAnimation("left"));
				this.lastDir = "left";
			} else {
				// No movement required
				if(callback != null) {
					callback(this);
				}
				return;
			}
			var _entity = this;
			var _target = target;
			Graphics.animateMove(this, position, function() {
				// Stop the move animation
				_entity.animation(MOVE_ANIMS.idle);
				if(callback != null) {
					callback(_entity);
				}
			}, function() {
				// TODO: Figure out the right distance
				return _entity.distanceFrom(_target) <= 1;
			});
		}
	};
	
	worldEntity.prototype.think = function() {
		// Nothing
	};
	
	worldEntity.prototype.isIdle = function() {
		return this.tempAnimation == null && this.animationRow == MOVE_ANIMS.idle;
	};
	
	worldEntity.prototype.distanceFrom = function(target) {
		return Math.abs(Math.abs(this.p() - target.p()) - this.el().width() / 2 - target.el().width() / 2);
	};
	
	worldEntity.prototype.maxHealth = function() {
		return 0;
	}
	
	worldEntity.prototype.getDamage = function() {
		return 0;
	};
	
	worldEntity.prototype.takeDamage = function(damage) {
		if(this.isAlive()) {
			this.hp -= damage;
			if(this.hp <= 0) {
				this.die();
			}
		}
	};
	
	worldEntity.prototype.die = function() {
		if(this.action != null) {
			this.action.terminateAction(this);
		}
		this.action = ActionFactory.getAction("Die");
		this.action.doAction(this);
	};

	worldEntity.prototype.isAlive = function() {
		return this.hp > 0;
	};
	
	return worldEntity;
});