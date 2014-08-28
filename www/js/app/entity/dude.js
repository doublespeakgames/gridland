define(['app/eventmanager', 'app/entity/worldentity', 'app/graphics/graphics', 
        'app/gamestate', 'app/action/actionfactory', 'app/gamecontent'], 
		function(EventManager, WorldEntity, Graphics, State, ActionFactory, Content) {
	var MAX_LEVEL = 26;
	var dude = function() {
		this._el = null;
		this.carrying = null;
		this.action = null;
		Graphics.updateHealth(State.health, State.maxHealth());
		Graphics.updateExperience(State.xp, this.toLevel());
		this.shield = 0;
		this.sword = 0;
	};
	dude.prototype = new WorldEntity({
		className: 'dude',
		spriteName: 'dude',
		nightSpriteName: 'dudenight'
	});
	dude.constructor = dude;
	
	dude.prototype.el = function() {
		if(this._el == null) {
			this._el = WorldEntity.prototype.el.call(this)
				.append(Graphics.make("animationLayer nightSprite"));
			this.held = Graphics.make("heldBlock").appendTo(this._el);;
		}
		return this._el;
	};
	
	dude.prototype.isAlive = function() {
		return State.health > 0;
	};
	
	dude.prototype.getAnimation = function(label) {
		if(label == "right" && this.carrying != null) {
			return 9;
		}
		return WorldEntity.prototype.getAnimation.call(this, label);
	};
	
	dude.prototype.think = function() {
		if(this.isIdle() && this.action == null) {
			var activity = require('app/world').getActivity();
			if(activity != null) {
				this.action = activity;
				this.action.doAction(this);
				return true;
			}
		}
		return false;
	};
	
	dude.prototype.gainXp = function(xp) {
		xp = xp || 0;
		State.xp += xp;
		if(isNaN(State.xp)){
			State.xp = 0;
		}
		while(State.xp >= this.toLevel()) {
			if(State.level >= MAX_LEVEL) {
				State.xp = this.toLevel() - 1;
			} else {
				State.xp -= this.toLevel();
				State.level++;
				State.counts.LEVEL = State.level;
				Graphics.levelUp(this);
				State.health = State.maxHealth();
				Graphics.updateHealth(State.health, State.maxHealth());
				EventManager.trigger('levelUp', [State.level]);
				if(this.action != null) {
					this.action.terminateAction(this);
				}
			}
		}
		Graphics.updateExperience(State.xp, this.toLevel());
	};
	
	dude.prototype.toLevel = function() {
		// 40, 160, 360, 640, 1000, 1440, 1960, 2560, 3240, 4000...
		return 40 * Math.pow(State.level, 2);
	};
	
	dude.prototype.heal = function(amount) {
		State.health += amount;
		State.health = State.health > State.maxHealth() ? State.maxHealth() : State.health;
		Graphics.updateHealth(State.health, State.maxHealth());
	};
	
	dude.prototype.getDamage = function() {
		
		// 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3...
		var strengthDamage = State.level < 7 ? 1 : Math.floor((State.level - 1) / 3);
		
		if(this.sword > 0) {
			this.sword--;
			Graphics.updateSword(this.sword, State.maxSword());
			return State.swordDamage() + strengthDamage;
		}
		
		return strengthDamage;
	};
	
	dude.prototype.takeDamage = function(damage, damager) {
		if(State.health > 0) {
			if(require('app/world').hasEffect('frozen')) {
				damage /= 2;
			}
			if(this.shield > 0) {
				var blocked = damage > this.shield ? this.shield : damage;
				this.shield -= blocked;
				damage -= blocked;
				Graphics.updateShield(this.shield, State.maxShield());
			}
			State.health -= damage;
			State.health = State.health < 0 ? 0 : State.health;
			if(State.health == 0 && this.action) {
				this.action.terminateAction(this);
			}
			if(State.health == 0) {
				EventManager.trigger('dudeDeath', [damager ? damager.options.monsterClass : "unknown"]);
			}
			Graphics.updateHealth(State.health, State.maxHealth());
		}
	};
	
	dude.prototype.animate = function() {
		WorldEntity.prototype.animate.call(this);
		if(this.carrying != null) {
			if(this.frame == 1) {
				this.held.css({transform: 'translate3d(0px, 1px, 0px)'});
			} else if(this.frame == 3) {
				this.held.css({transform: 'translate3d(0px, -1px, 0px)'});
			} else {
				this.held[0].style = '';
			}
		}
	};
	
	dude.prototype.animationOnce = function(row) {
		// Unarmed animation
		if((row == 3 || row == 4) && this.sword == 0) {
			row += 8;
		}
		WorldEntity.prototype.animationOnce.call(this, row);
	};
	
	dude.prototype.speed = function() {
		var W = require('app/world');
		var speed = this.options.speed / W.getDebugMultiplier();
		return !W.hasEffect('haste') ? speed / 2 : speed / 8;
	};
	
	dude.prototype.hasSword = function() {
		return this.sword > 0;
	};
	
	return dude;
});