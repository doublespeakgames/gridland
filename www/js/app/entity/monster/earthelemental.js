define(['app/entity/monster/monster', 'app/action/actionfactory'], 
		function(Monster, ActionFactory) {
	
	var EarthElemental = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		this.hp(this.maxHealth());
		this.xp = 2;
	};
	EarthElemental.prototype = new Monster({
		monsterClass: 'earthElemental',
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
	
	EarthElemental.prototype.maxHealth = function() {
		return 14; // 3 hits with a sword, 7 hits without
	};
	
	EarthElemental.prototype.getDamage = function() {
		// between 4 and 12 damage
		return 2;
	};
	
	return EarthElemental;
});