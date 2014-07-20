define(['app/entity/monster/monster', 'app/action/actionfactory'], 
		function(Monster, ActionFactory) {
	
	var Imp = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		this.hostile = true;
		this.action = null;
		
		this.maxHealth = 36; // 4 hits with sword, 12 without
		this.damage = 2; // Between 14 and 46
		this.xp = 52;
		
		this.hp(this.getMaxHealth());
	};
	Imp.prototype = new Monster({
		monsterClass: 'imp',
		spriteName: 'imp',
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
	
	return Imp;
});