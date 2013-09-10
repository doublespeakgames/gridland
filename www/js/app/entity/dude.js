define(['app/entity/worldentity', 'app/world', 'app/graphics', 'app/gamestate'], 
		function(WorldEntity, World, Graphics, State) {
	var dude = function() {
		this.carrying = null;
		State.health = this.maxHealth();
		Graphics.updateHealth(State.health, this.maxHealth());
	};
	dude.prototype = new WorldEntity({
		className: 'dude'
	});
	dude.constructor = dude;
	
	dude.prototype.el = function() {
		if(this._el == null) {
			this._el = WorldEntity.prototype.el.call(this).append(Graphics.newElement("heldBlock"));
		}
		return this._el;
	};
	
	dude.prototype.think = function() {
		if(this.isIdle()) {
			var activity = World.getActivity();
			if(activity != null) {
				activity(this);
			}
		}
	};
	
	dude.prototype.maxHealth = function() {
		return 15;
	};
	
	dude.prototype.heal = function(amount) {
		State.health += amount;
		State.health = State.health > this.maxHealth() ? this.maxHealth() : State.health;
		Graphics.updateHealth(State.health, this.maxHealth());
	};
	
	dude.prototype.takeDamage = function(damage) {
		State.health -= damage;
		State.health = State.health < 0 ? 0 : State.health;
		// TODO: Handle death
		Graphics.updateHealth(State.health, this.maxHealth());
	};
	
	dude.prototype.animate = function() {
		if(this.carrying != null && this.animationRow == 1) {
			this.animationRow = 5;
		}
		WorldEntity.prototype.animate.call(this);
		if(this.carrying != null) {
			if(this.frame == 1) {
				this.carrying.css('top', '1px');
			} else if(this.frame == 3) {
				this.carrying.css('top', '-1px');
			} else {
				this.carrying.css('top', '0px');
			}
			this.carrying.top
		}
	};
	
	return dude;
});