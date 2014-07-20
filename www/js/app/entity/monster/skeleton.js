define(['app/entity/monster/monster', 'app/action/actionfactory', 'app/graphics/graphics'], 
		function(Monster, ActionFactory, Graphics) {
	
	var Skeleton = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		
		this.maxHealth = 1;
		this.damage = 3;
		this.xp = 3;
		
		this.hp(this.getMaxHealth());
	};
	Skeleton.prototype = new Monster({
		monsterClass: 'skeleton',
		spriteName: 'skeleton',
		arrowClass: 'arrow',
		speed: 50,
		arrowSpeed: 7
	});
	Skeleton.constructor = Skeleton;
	
	Skeleton.prototype.think = function() {
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
	
	Skeleton.prototype.attackRange = function(target) {
		// Skeletons are ranged
		return this.p() > 10 && this.p() < Graphics.worldWidth() - 10 && 
			Math.abs(this.p() - target.p()) <= 200;
	};
	
	return Skeleton;
});