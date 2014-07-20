define(['app/entity/monster/monster', 'app/action/actionfactory'], 
		function(Monster, ActionFactory) {
	
	var WaterElemental = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		this.hostile = true;
		this.action = null;
		
		this.maxHealth = 18; // 3 hits with a sword, 9 without
		this.damage = 2; // Between 10 and 34
		this.xp = 34;
		
		this.hp(this.getMaxHealth());
	};
	WaterElemental.prototype = new Monster({
		monsterClass: 'waterElemental',
		spriteName: 'waterelemental',
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
	
	WaterElemental.prototype.hasSword = function() {
		return true;
	};
	
	return WaterElemental;
});