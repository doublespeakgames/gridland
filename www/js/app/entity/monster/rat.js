define(['app/entity/monster/monster', 'app/action/actionfactory'], 
		function(Monster, ActionFactory) {
	
	var Rat = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		
		this.maxHealth = 2;
		this.damage = 1;
		this.xp = 4;
		
		this.hp(this.getMaxHealth());
	};
	Rat.prototype = new Monster({
		monsterClass: 'rat',
		spriteName: 'rat',
		speed: 20
	});
	Rat.constructor = Rat;
	
	Rat.prototype.think = function() {
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
	
	return Rat;
});