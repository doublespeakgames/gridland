define(['app/entity/entity', 'app/graphics'], function(Entity, Graphics) {
	
	var MOVE_ANIMS = {
		idle: 0,
		right: 1,
		left: 2
	};
	
	var worldEntity = function(options) {
		this.options = $.extend({}, this.options, {
			// Nuthin'
		}, options);
	};
	worldEntity.prototype = new Entity();
	worldEntity.constructor = worldEntity;
	
	worldEntity.prototype.move = function(position, callback) {
		if(this.tempAnimation == null) {
			if(this.p() < position) {
				// Moving right
				this.animation(MOVE_ANIMS.right);
			} else if(this.p() > position) {
				// Moving left
				this.animation(MOVE_ANIMS.left);
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
				this.animation(MOVE_ANIMS.right);
			} else if(this.p() > position) {
				// Moving left
				this.animation(MOVE_ANIMS.left);
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
				return _entity.distanceFrom(_target) <= 5;
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
	
	return worldEntity;
});