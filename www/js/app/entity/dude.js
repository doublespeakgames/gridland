define(['app/eventmanager', 'app/entity/worldentity', 'app/world', 'app/graphics', 
        'app/gamestate', 'app/action/actionfactory', 'app/gamecontent'], 
		function(EventManager, WorldEntity, World, Graphics, State, ActionFactory, Content) {
	var dude = function() {
		this._el = null;
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
			EventManager.trigger('levelUp');
			if(this.action != null) {
				this.action.terminateAction(this);
			}
		}
		Graphics.updateExperience(State.xp, this.toLevel());
	};
	
	dude.prototype.toLevel = function() {
		return 40 * State.level;
	};
	
	dude.prototype.maxHealth = function() {
		return 20 + 10 * State.level;
	};
	
	dude.prototype.maxShield = function() {
		if(State.hasBuilding(Content.BuildingType.Sawmill5)) {
			return 18;
		}
		if(State.hasBuilding(Content.BuildingType.Sawmill4)) {
			return 15;
		}
		if(State.hasBuilding(Content.BuildingType.Sawmill3)) {
			return 12;
		}
		if(State.hasBuilding(Content.BuildingType.Sawmill2)) {
			return 9;
		}
		if(State.hasBuilding(Content.BuildingType.Sawmill)) {
			return 6;
		}
		return 3;
	};
	
	dude.prototype.maxSword = function() {
		if(State.hasBuilding(Content.BuildingType.Blacksmith5)) {
			return 18;
		}
		if(State.hasBuilding(Content.BuildingType.Blacksmith4)) {
			return 15;
		}
		if(State.hasBuilding(Content.BuildingType.Blacksmith3)) {
			return 12;
		}
		if(State.hasBuilding(Content.BuildingType.Blacksmith2)) {
			return 9;
		}
		if(State.hasBuilding(Content.BuildingType.Blacksmith)) {
			return 6;
		}
		return 3;
	};
	
	dude.prototype.heal = function(amount) {
		State.health += amount;
		State.health = State.health > this.maxHealth() ? this.maxHealth() : State.health;
		Graphics.updateHealth(State.health, this.maxHealth());
	};
	
	dude.prototype.getDamage = function(damageToKill) {
		var damage = 1;
		damageToKill -= damage;
		if(this.sword > 0) {
			var add = this.sword > damageToKill ? damageToKill : this.sword;
			damage += add;
			this.sword -=  add;
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
				this.carrying.el().css('top', '1px');
			} else if(this.frame == 3) {
				this.carrying.el().css('top', '-1px');
			} else {
				this.carrying.el().css('top', '0px');
			}
		}
	};
	
	return dude;
});