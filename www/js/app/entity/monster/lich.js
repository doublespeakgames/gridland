define(['app/entity/monster/monster', 'app/action/actionfactory', 'app/graphics/graphics'], 
		function(Monster, ActionFactory, Graphics) {
	
	var Lich = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		this.hp(this.maxHealth());
		this.xp = 3;
		this.spellCooldown = 24;
	};
	Lich.prototype = new Monster({
		monsterClass: 'lich',
		speed: 50
	});
	Lich.constructor = Lich;
	
	Lich.prototype.think = function() {
		var World = require('app/world');
		if(this.isAlive() && this.spellCooldown-- == 0) {
			this.spellCooldown = 24;
			if(this.action) {
				this.action.terminateAction(this);
			}
			this.action = ActionFactory.getAction("LichSpell", {
				target: World.getDude()
			});
			this.action.doAction(this);
			return true;
		}
		else if(this.isIdle() && this.isAlive() && this.action == null) {
			if(!this.attackRange(World.getDude())) {
				this.action = ActionFactory.getAction("MoveTo", {
					target: World.getDude()
				});
			} else {
				this.action = ActionFactory.getAction("Attack", {
					target: World.getDude()
				});
			}
			if(this.action != null) {
				this.action.doAction(this);
				return true;
			}
		}
		return false;
	};
	
	Lich.prototype.getLoot = function() {
		// Lich always drops dragons. How does it carry them all?!
		return "dragon";
	};
	
	Lich.prototype.maxHealth = function() {
		return 3000;//30;
	};
	
	Lich.prototype.getDamage = function() {
		return 0;//15;
	};
	
	Lich.prototype.getHitboxWidth = function() {
		return 5;
	};
	
	return Lich;
});