define(['app/entity/monster/monster', 'app/action/actionfactory', 'app/graphics/graphics'], 
		function(Monster, ActionFactory, Graphics) {
	
	var FireElemental = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		this.hp(this.maxHealth());
		this.xp = 3;
	};
	FireElemental.prototype = new Monster({
		monsterClass: 'fireElemental',
		arrowClass: 'arrow fireball',
		speed: 50,
		arrowSpeed: 7
	});
	FireElemental.constructor = FireElemental;
	
	FireElemental.prototype.think = function() {
		var _this = this;
		var World = require('app/world');
		if(_this.isIdle() && _this.isAlive() && _this.action == null) {
			if(!_this.attackRange(World.getDude())) {
				_this.action = ActionFactory.getAction("MoveTo", {
					target: World.getDude()
				});
			} else {
				_this.action = ActionFactory.getAction("Shoot", {
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
	
	FireElemental.prototype.attackRange = function(target) {
		// Fire Elementals are ranged
		return this.p() > 10 && this.p() < Graphics.worldWidth() - 10 && 
			Math.abs(this.p() - target.p()) <= 200;
	};
	
	FireElemental.prototype.maxHealth = function() {
		return 6; // 1 hit with sword, 3 without
	};
	
	FireElemental.prototype.getDamage = function() {
		// Between 0 and 12 damage
		return 6;
	};
	
	return FireElemental;
});