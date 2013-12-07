define(['app/entity/monster/monster', 'app/action/actionfactory'], 
		function(Monster, ActionFactory) {
	
	var Imp = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		this.hostile = true;
		this.action = null;
		this.hp(this.maxHealth());
		this.xp = 3;
	};
	Imp.prototype = new Monster({
		monsterClass: 'imp',
		speed: 15
	});
	Imp.constructor = Imp;
	
	Imp.prototype.think = function() {
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
	
	Imp.prototype.maxHealth = function() {
		return 6;
	};
	
	Imp.prototype.getDamage = function() {
		return 5;
	};
	
	return Imp;
});