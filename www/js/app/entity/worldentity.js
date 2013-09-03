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
	
	worldEntity.prototype.think = function() {
		// Nothing
	};
	
	return worldEntity;
});