define(['app/entity/worldentity', 'app/world', 'app/graphics', 'app/gamestate', 'app/action/actionfactory'], 
		function(WorldEntity, World, Graphics, State, ActionFactory) {
	var dude = function() {
		this.carrying = null;
		this.action = null;
		State.health = this.maxHealth();
		Graphics.updateHealth(State.health, this.maxHealth());
		Graphics.updateExperience(State.xp, this.toLevel());
		this.shield = 0;
		this.sword = 0;
	};
	dude.prototype = new WorldEntity({
		className: 'dude'
	});
	dude.constructor = dude;
	
	dude.prototype.el = function() {
		if(this._el == null) {
			this._el = WorldEntity.prototype.el.call(this)
			.append(Graphics.newElement("animationLayer nightSprite"))
			.append(Graphics.newElement("heldBlock"));
		}
		return this._el;
	};
	
	dude.prototype.getAnimation = function(label) {
		if(label == "right" && this.carrying != null) {
			return 9;
		}
		return WorldEntity.prototype.getAnimation.call(this, label);
	};
	
	dude.prototype.think = function() {
		if(this.isIdle() && this.action == null) {
			var activity = World.getActivity();
			if(activity != null) {
				this.action = activity;
				this.action.doAction(this);
			}
		}
	};
	
	dude.prototype.gainXp = function(xp) {
		State.xp += xp;
		if(State.xp >= this.toLevel()) {
			State.xp -= this.toLevel();
			State.level++;
			Graphics.levelUp(this);
			State.health = this.maxHealth();
			Graphics.updateHealth(State.health, this.maxHealth());
			World.wipeMonsters();
		}
		Graphics.updateExperience(State.xp, this.toLevel());
	};
	
	dude.prototype.toLevel = function() {
		return 30 * State.level;
	};
	
	dude.prototype.maxHealth = function() {
		return 20 + 10 * State.level;
	};
	
	dude.prototype.maxShield = function() {
		return 3;
	};
	
	dude.prototype.maxSword = function() {
		if(State.hasBuilding("blacksmith")) {
			return 9;
		}
		return 3;
	};
	
	dude.prototype.heal = function(amount) {
		State.health += amount;
		State.health = State.health > this.maxHealth() ? this.maxHealth() : State.health;
		Graphics.updateHealth(State.health, this.maxHealth());
	};
	
	dude.prototype.getDamage = function() {
		var damage = 1;
		if(this.sword > 0) {
			damage += this.sword;
			this.sword =  0;
			Graphics.updateSword(this.sword, this.maxSword());
		}
		return damage;
	};
	
	dude.prototype.takeDamage = function(damage) {
		if(State.health > 0) {
			if(this.shield > 0) {
				var blocked = damage > this.shield ? this.shield : damage;
				this.shield -= blocked;
				damage -= blocked;
				Graphics.updateShield(this.shield, this.maxShield());
			}
			State.health -= damage;
			State.health = State.health < 0 ? 0 : State.health;
			Graphics.updateHealth(State.health, this.maxHealth());
			if(State.health <= 0) {
				this.action = ActionFactory.getAction("Die");
				this.action.doAction(this);
			}
		}
	};
	
	dude.prototype.animate = function() {
		WorldEntity.prototype.animate.call(this);
		if(this.carrying != null) {
			if(this.frame == 1) {
				this.carrying.css('top', '1px');
			} else if(this.frame == 3) {
				this.carrying.css('top', '-1px');
			} else {
				this.carrying.css('top', '0px');
			}
		}
	};
	
	return dude;
});