define(['app/entity/monster/monster', 'app/action/actionfactory'], 
		function(Monster, ActionFactory) {
	
	var WaterElemental = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		this.hostile = true;
		this.action = null;
		this.hp(this.maxHealth());
		this.xp = 34;
	};
	WaterElemental.prototype = new Monster({
		monsterClass: 'waterElemental',
		speed: 15
	});
	WaterElemental.constructor = WaterElemental;
	
	WaterElemental.prototype.think = function() {
		var _this = this;
		var World = require('app/world');
		if(_this.isIdle() && _this.isAlive() && _this.action == null) {
			if(!_this.attackRange(World.getDude())) {
				_this.action = ActionFactory.getAction("MoveTo", {
					target: World.getDude()
				});
			} else {
				_this.action = ActionFactory.getAction("FastAttack", {
					target: World.getDude()
				});
			}
			if(_this.action != null) {
				_this.action.doAction(_this);
				return true;
			}
		}
		return false;
	};
	
	WaterElemental.prototype.maxHealth = function() {
		return 8; // 2 hits with a sword, 4 without
	};
	
	WaterElemental.prototype.getDamage = function() {
		// Between 4 and 12
		return 2;
	};
	
	return WaterElemental;
});