define(['app/entity/monster/monster', 'app/action/actionfactory'], 
		function(Monster, ActionFactory) {
	
	var Zombie = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		
		this.maxHealth = 4;
		this.damage = 1;
		this.xp = 2;
		
		this.hp(this.getMaxHealth());
	};
	Zombie.prototype = new Monster({
		monsterClass: 'zombie',
		spriteName: 'zombie',
		speed: 80
	});
	Zombie.constructor = Zombie;
	
	Zombie.prototype.think = function() {
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
	
	return Zombie;
});