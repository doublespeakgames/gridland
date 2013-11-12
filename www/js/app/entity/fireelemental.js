define(['app/entity/monster', 'app/action/actionfactory', 'app/graphics'], 
		function(Monster, ActionFactory, Graphics) {
	
	var FireElemental = function(options) {
		this.options = $.extend({}, this.options, {
			power: 3
		}, options);
		this.hp(this.maxHealth());
		this.xp = 3;
	};
	FireElemental.prototype = new Monster({
		monsterClass: 'fireElemental',
		arrowClass: 'arrow',
		speed: 50,
		arrowSpeed: 7
	});
	FireElemental.constructor = FireElemental;
	
	FireElemental.prototype.think = function() {
		if(this.isIdle() && this.isAlive() && this.action == null) {
			var _this = this;
			require(['app/world'], function(World) {
				if(!_this.attackRange(World.dude)) {
					_this.action = ActionFactory.getAction("MoveTo", {
						target: World.dude
					});
				} else {
					_this.action = ActionFactory.getAction("Shoot", {
						target: World.dude
					});
				}
				if(_this.action != null) {
					_this.action.doAction(_this);
				}
			});
		}
	};
	
	FireElemental.prototype.attackRange = function(target) {
		// Fire Elementals are ranged
		return this.p() > 10 && this.p() < Graphics.worldWidth() - 10 && 
			Math.abs(this.p() - target.p()) <= 200;
	};
	
	FireElemental.prototype.maxHealth = function() {
		return 2;
	};
	
	FireElemental.prototype.getDamage = function() {
		return 12;
	};
	
	return FireElemental;
});