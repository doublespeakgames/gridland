define(['app/entity/monster/monster', 'app/action/actionfactory', 'app/graphics/graphics'], 
		function(Monster, ActionFactory, Graphics) {
	
	var Lich = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		
		this.maxHealth = 120; // 15 hits with sword, 40 without
		this.damage = 5; // Between 40 and 120
		this.xp = 500;
		
		this.dropChance = 0.25; // 75%!
		this.hp(this.getMaxHealth());
		this.spellCooldown = 16;
		this.teleportCooldown = 52;
	};
	Lich.prototype = new Monster({
		monsterClass: 'lich',
		spriteName: 'lich',
		speed: 100
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
		else if(this.isAlive() && this.teleportCooldown-- == 0) {
			this.teleportCooldown = 80;
			if(this.action) {
				this.action.terminateAction(this);
			}
			this.action = ActionFactory.getAction("Teleport", {
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
		return "callDragon";
	};
	
	Lich.prototype.getHitboxWidth = function() {
		return 5;
	};
	
	return Lich;
});