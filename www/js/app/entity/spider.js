define(['app/entity/monster', 'app/action/actionfactory'], 
		function(Monster, ActionFactory) {
	
	var Spider = function(options) {
		this.options = $.extend({}, this.options, {
			power: 3
		}, options);
		this.hostile = true;
		this.action = null;
		this.hp = this.maxHealth();
		this.xp = 3;
	};
	Spider.prototype = new Monster({
		monsterClass: 'spider',
		speed: 20
	});
	Spider.constructor = Spider;
	
	Spider.prototype.think = function() {
		if(this.isIdle() && this.isAlive() && this.action == null) {
			var _this = this;
			require(['app/world'], function(World) {
				if(!_this.attackRange(World.dude)) {
					_this.action = ActionFactory.getAction("MoveTo", {
						target: World.dude
					});
				} else {
					_this.action = ActionFactory.getAction("FastAttack", {
						target: World.dude
					});
				}
				if(_this.action != null) {
					_this.action.doAction(_this);
				}
			});
		}
	};
	
	Spider.prototype.maxHealth = function() {
		return 3;
	};
	
	Spider.prototype.getDamage = function() {
		return 3;
	};
	
	return Spider;
});