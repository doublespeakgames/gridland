define(['app/entity/monster/monster', 'app/action/actionfactory', 'app/graphics/graphics'], 
		function(Monster, ActionFactory, Graphics) {
	
	var Warlock = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		
		this.maxHealth = 18; // 2 hits with sword, 6 without
		this.damage = 5; // Between 5 and 30
		this.xp = 43;
		
		this.hp(this.getMaxHealth());
	};
	Warlock.prototype = new Monster({
		monsterClass: 'warlock',
		spriteName: 'warlock',
		arrowClass: 'arrow fireball',
		speed: 50,
		arrowSpeed: 7
	});
	Warlock.constructor = Warlock;
	
	Warlock.prototype.think = function() {
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
	
	Warlock.prototype.attackRange = function(target) {
		// Warlocks are ranged
		return this.p() > 10 && this.p() < Graphics.worldWidth() - 10 && 
			Math.abs(this.p() - target.p()) <= 200;
	};
	
	return Warlock;
});