define(['app/entity/monster/monster', 'app/action/actionfactory'], 
		function(Monster, ActionFactory) {
	
	var Demon = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		this.hp(this.maxHealth());
		this.xp = 35;
	};
	Demon.prototype = new Monster({
		monsterClass: 'demon',
		speed: 80
	});
	Demon.constructor = Demon;
	
	Demon.prototype.think = function() {
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
	
	Demon.prototype.maxHealth = function() {
		return 27; // 3 hits with sword, 9 without
	};
	
	Demon.prototype.getDamage = function() {
		return 3; // Between 6 and 24
	};
	
	return Demon;
});