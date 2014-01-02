define(['app/entity/monster/monster', 'app/action/actionfactory', 'app/graphics/graphics'], 
		function(Monster, ActionFactory, Graphics) {
	
	var Lich = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		this.hp(this.maxHealth());
		this.xp = 3;
	};
	Lich.prototype = new Monster({
		monsterClass: 'lich',
		speed: 50
	});
	Lich.constructor = Lich;
	
	Lich.prototype.think = function() {
		var World = require('app/world');
		if(this.isIdle() && this.isAlive() && this.action == null) {
			if(!this.attackRange(World.getDude())) {
				this.action = ActionFactory.getAction("MoveTo", {
					target: World.getDude()
				});
			} else {
				this.action = ActionFactory.getAction("Attack", {
					target: World.getDude()
				});
			}
			if(this.action != null) {
				this.action.doAction(this);
				return true;
			}
		}
		return false;
	};
	
	Lich.prototype.maxHealth = function() {
		return 30;
	};
	
	Lich.prototype.getDamage = function() {
		return 15;
	};
	
	Lich.prototype.getHitboxWidth = function() {
		return 5;
	};
	
	return Lich;
});