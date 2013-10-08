define(['app/entity/worldentity', 'app/action/actionfactory'], 
		function(WorldEntity, ActionFactory) {
	
	var Zombie = function(options) {
		this.options = $.extend({}, this.options, {
			power: 3
		}, options);
		this.hostile = true;
		this.action = null;
		this.hp = this.maxHealth();
		this.xp = 1;
	};
	Zombie.prototype = new WorldEntity({
		className: 'zombie',
		speed: 80
	});
	Zombie.constructor = Zombie;
	
	Zombie.prototype.think = function() {
		if(this.isIdle() && this.isAlive() && this.action == null) {
			var _this = this;
			require(['app/world'], function(World) {
				var action = null;
				if(!_this.attackRange(World.dude)) {
					_this.action = ActionFactory.getAction("MoveTo", {
						target: World.dude
					});
				} else {
					_this.action = ActionFactory.getAction("Attack", {
						target: World.dude
					});
				}
				if(_this.action != null) {
					_this.action.doAction(_this);
				}
			});
		}
	};
	
	Zombie.prototype.maxHealth = function() {
		return 3;
	};
	
	Zombie.prototype.getDamage = function() {
		return 1;
	};
	
	return Zombie;
});