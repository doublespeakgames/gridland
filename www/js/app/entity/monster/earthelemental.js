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
		return 18;
	};
	
	EarthElemental.prototype.getDamage = function() {
		return 1;
	};
	
	return EarthElemental;
});