define(['app/entity/monster', 'app/action/actionfactory'], 
		function(Monster, ActionFactory) {
	
	var EarthElemental = function(options) {
		this.options = $.extend({}, this.options, {
			power: 3
		}, options);
		this.hp(this.maxHealth());
		this.xp = 2;
	};
	EarthElemental.prototype = new Monster({
		monsterClass: 'earthElemental',
		speed: 80
	});
	EarthElemental.constructor = EarthElemental;
	
	EarthElemental.prototype.think = function() {
		if(this.isIdle() && this.isAlive() && this.action == null) {
			var _this = this;
			require(['app/world'], function(World) {
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
			});
		}
	};
	
	EarthElemental.prototype.maxHealth = function() {
		return 18;
	};
	
	EarthElemental.prototype.getDamage = function() {
		return 1;
	};
	
	return EarthElemental;
});