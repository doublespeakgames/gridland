define(['app/entity/monster/monster', 'app/action/actionfactory', 'app/graphics/graphics'], 
		function(Monster, ActionFactory, Graphics) {
	
	var Lizardman = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		this.hp(this.maxHealth());
		this.xp = 4;
	};
	Lizardman.prototype = new Monster({
		monsterClass: 'lizardman',
		arrowClass: 'arrow',
		speed: 50,
		arrowSpeed: 7
	});
	Lizardman.constructor = Lizardman;
	
	Lizardman.prototype.think = function() {
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
	
	Lizardman.prototype.attackRange = function(target) {
		// Lizardmen are ranged
		return this.p() > 10 && this.p() < Graphics.worldWidth() - 10 && 
			Math.abs(this.p() - target.p()) <= 200;
	};
	
	Lizardman.prototype.maxHealth = function() {
		return 2;
	};
	
	Lizardman.prototype.getDamage = function() {
		return 6;
	};
	
	return Lizardman;
});