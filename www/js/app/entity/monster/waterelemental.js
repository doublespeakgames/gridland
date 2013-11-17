define(['app/entity/monster/monster', 'app/action/actionfactory'], 
		function(Monster, ActionFactory) {
	
	var WaterElemental = function(options) {
		this.options = $.extend({}, this.options, {
			power: 3
		}, options);
		this.hostile = true;
		this.action = null;
		this.hp(this.maxHealth());
		this.xp = 3;
	};
	WaterElemental.prototype = new Monster({
		monsterClass: 'waterElemental',
		speed: 15
	});
	WaterElemental.constructor = WaterElemental;
	
	WaterElemental.prototype.think = function() {
		if(this.isIdle() && this.isAlive() && this.action == null) {
			var _this = this;
			require(['app/world'], function(World) {
				if(!_this.attackRange(World.dude)) {
					_this.action = ActionFactory.getAction("MoveTo", {
						target: World.dude
					});
				} else {
					_this.action = ActionFactory.getAction("FastAttack", {
						target: World.dude
					});
				}
				if(_this.action != null) {
					_this.action.doAction(_this);
				}
			});
		}
	};
	
	WaterElemental.prototype.maxHealth = function() {
		return 4;
	};
	
	WaterElemental.prototype.getDamage = function() {
		return 3;
	};
	
	return WaterElemental;
});