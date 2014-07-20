define(['app/entity/monster/monster', 'app/action/actionfactory'], 
		function(Monster, ActionFactory) {
	
	var EarthElemental = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		
		this.maxHealth = 24; // 4 hits with a sword, 12 hits without
		this.damage = 1; // between 4 and 12 damage
		this.xp = 20;
		
		this.hp(this.getMaxHealth());
	};
	EarthElemental.prototype = new Monster({
		monsterClass: 'earthElemental',
		spriteName: 'earthelemental',
		speed: 80
	});
	EarthElemental.constructor = EarthElemental;
	
	EarthElemental.prototype.think = function() {
		var _this = this;
		var World = require('app/world');
		if(_this.isIdle() && _this.isAlive() && _this.action == null) {
			if(!_this.attackRange(World.getDude())) {
				_this.action = ActionFactory.getAction("MoveTo", {
					target: World.getDude()
				});
			} else {
				_this.action = ActionFactory.getAction("Attack", {
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
	
	return EarthElemental;
});