define(['app/entity/worldentity', 'app/action/actionfactory'], 
		function(WorldEntity, ActionFactory) {
	
	var HauntedArmour = function(options) {
		this.options = $.extend({}, this.options, {
			power: 3
		}, options);
		this.hostile = true;
		this.action = null;
		this.hp = this.maxHealth();
		this.xp = 1;
	};
	HauntedArmour.prototype = new WorldEntity({
		className: 'hauntedArmour',
		speed: 80
	});
	HauntedArmour.constructor = HauntedArmour;
	
	HauntedArmour.prototype.think = function() {
		if(this.isIdle() && this.isAlive() && this.action == null) {
			var _this = this;
			require(['app/world'], function(World) {
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
	
	HauntedArmour.prototype.maxHealth = function() {
		return 10;
	};
	
	HauntedArmour.prototype.getDamage = function() {
		return 3;
	};
	
	HauntedArmour.prototype.getHitboxWidth = function() {
		return 20;
	};
	
	return HauntedArmour;
});