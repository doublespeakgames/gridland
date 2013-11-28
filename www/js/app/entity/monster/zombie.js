define(['app/entity/monster/monster', 'app/action/actionfactory'], 
		function(Monster, ActionFactory) {
	
	var Zombie = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		this.hp(this.maxHealth());
		this.xp = 1;
	};
	Zombie.prototype = new Monster({
		monsterClass: 'zombie',
		speed: 80
	});
	Zombie.constructor = Zombie;
	
	Zombie.prototype.think = function() {
		var _this = this;
		require(['app/world'], function(World) {
			if(_this.isIdle() && _this.isAlive() && _this.action == null) {
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
			}
		});
	};
	
	Zombie.prototype.maxHealth = function() {
		return 3;
	};
	
	Zombie.prototype.getDamage = function() {
		return 1;
	};
	
	return Zombie;
});