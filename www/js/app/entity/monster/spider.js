define(['app/entity/monster/monster', 'app/action/actionfactory'], 
		function(Monster, ActionFactory) {
	
	var Spider = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		this.hostile = true;
		this.action = null;
		this.hp(this.maxHealth());
		this.xp = 3;
	};
	Spider.prototype = new Monster({
		monsterClass: 'spider',
		speed: 20
	});
	Spider.constructor = Spider;
	
	Spider.prototype.think = function() {
		var _this = this;
		var World = require('app/world');
		if(_this.isIdle() && _this.isAlive() && _this.action == null) {
			if(!_this.attackRange(World.getDude())) {
				_this.action = ActionFactory.getAction("MoveTo", {
					target: World.getDude()
				});
			} else {
				_this.action = ActionFactory.getAction("FastAttack", {
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
	
	Spider.prototype.maxHealth = function() {
		return 4; // 2 hits with a sword, 4 without
	};
	
	Spider.prototype.getDamage = function() {
		// Between 2 and 6 (doublestrike)
		return 1;
	};
	
	return Spider;
});