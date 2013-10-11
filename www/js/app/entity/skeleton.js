define(['app/entity/worldentity', 'app/action/actionfactory', 'app/graphics'], 
		function(WorldEntity, ActionFactory, Graphics) {
	
	var Skeleton = function(options) {
		this.options = $.extend({}, this.options, {
			power: 3
		}, options);
		this.hostile = true;
		this.action = null;
		this.hp = this.maxHealth();
		this.xp = 3;
	};
	Skeleton.prototype = new WorldEntity({
		className: 'skeleton',
		arrowClass: 'arrow',
		speed: 50,
		arrowSpeed: 7
	});
	Skeleton.constructor = Skeleton;
	
	Skeleton.prototype.think = function() {
		if(this.isIdle() && this.isAlive() && this.action == null) {
			var _this = this;
			require(['app/world'], function(World) {
				if(!_this.attackRange(World.dude)) {
					_this.action = ActionFactory.getAction("MoveTo", {
						target: World.dude
					});
				} else {
					_this.action = ActionFactory.getAction("Shoot", {
						target: World.dude
					});
				}
				if(_this.action != null) {
					_this.action.doAction(_this);
				}
			});
		}
	};
	
	Skeleton.prototype.attackRange = function(target) {
		// Skeletons are ranged
		return this.p() > 10 && this.p() < Graphics.worldWidth() - 10 && 
			Math.abs(this.p() - target.p()) <= 200;
	};
	
	Skeleton.prototype.maxHealth = function() {
		return 2;
	};
	
	Skeleton.prototype.getDamage = function() {
		return 2;
	};
	
	return Skeleton;
});