define(['app/entity/entity', 'app/eventmanager'], 
	function(Entity, EventManager) {
	
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
		this.hp(this.getMaxHealth());
		this.gone = false;
	};
	worldEntity.prototype = new Entity();
	worldEntity.constructor = worldEntity;
	
	worldEntity.prototype.hp = function(value) {
		if(value != null) {
			this._hp = value;
			EventManager.trigger('healthChanged', [this]);
		}
		return this._hp;
	};
	
	worldEntity.prototype.getAnimation = function(label) {
		return MOVE_ANIMS[label];
	};
	
	worldEntity.prototype.move = function(position, callback) {
		this.tempAnimation = null;
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
		var G = require('app/graphics/graphics');
		G.animateMove(this, position, function() {
			// Stop the move animation
			_entity.makeIdle();
			if(callback != null) {
				callback(_entity);
			}
		});
	};
	
	worldEntity.prototype.moveTo = function(target, callback) {
		var G = require('app/graphics/graphics');
		this.tempAnimation = null;
		var position = target.p();
		if(position < 30) {
			position = 30;
		}
		if(position > G.worldWidth() - 30) {
			position = G.worldWidth() - 30;
		}
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
		G.animateMove(this, position, function() {
			// Stop the move animation
			_entity.makeIdle();
			if(callback != null) {
				callback(_entity);
			}
		}, function() {
			return _entity.p() > 10 && _entity.p() < G.worldWidth() - 10 && _entity.attackRange(_target);
		});
	};
	
	worldEntity.prototype.think = function() {
		// Nothing
		return false;
	};
	
	worldEntity.prototype.makeIdle = function() {
		this.animation(MOVE_ANIMS.idle);
	};
	
	worldEntity.prototype.isIdle = function() {
		return this.action == null;
	};
	
	worldEntity.prototype.attackRange = function(target) {
		return Math.abs(this.p() - target.p()) <= (this.getHitboxWidth() / 2) + (target.getHitboxWidth() / 2);
	};
	
	worldEntity.prototype.distanceFrom = function(target) {
		if(Math.abs(this.p() - target.p()) < (this.getHitboxWidth() + target.getHitboxWidth()) / 2) return 0;
		return Math.abs(Math.abs(this.p() - target.p()) - this.getHitboxWidth() / 2 - target.getHitboxWidth() / 2);
	};
	
	worldEntity.prototype.getMaxHealth = function() {
		return 0;
	};
	
	worldEntity.prototype.getDamage = function() {
		return 0;
	};
	
	worldEntity.prototype.takeDamage = function(damage) {
		if(this.isAlive()) {
			this.hp(this.hp() - damage);
			if(this.hp() <= 0) {
				this.die();
			}
		}
	};
	
	worldEntity.prototype.die = function() {
		if(this.action != null) {
			this.action.terminateAction(this);
		}
		this.action = require('app/action/actionfactory').getAction("Die");
		this.action.doAction(this);
	};

	worldEntity.prototype.isAlive = function() {
		return this.hp() > 0;
	};
	
	worldEntity.prototype.getHitboxWidth = function() {
		return this.width();
	};
	
	worldEntity.prototype.hasSword = function() {
		return false;
	};
	
	return worldEntity;
});