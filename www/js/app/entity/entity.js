define([ 'jquery', 'app/events', 'app/graphics' ], function($, Events, Graphics) {
	var entity = function() {
		this.className = "blank";
		this.animationFrames = 4;
		this.frame = 0;
		this.animation = 0;
		this.tempAnimation = null;
		
		/**
		 * Gets the html element for this Entity, creating it if necessary
		 */
		this._el;
		this.el = function() {
			if(this._el == null) {
				this._el = $('<div>').addClass(this.className);
			}
			return this._el;
		};
		
		/**
		 * Gets or sets the velocity
		 */
		this.v = function(param) {
			if (param != null) {
				this._velocity = param;
			}
			return this._velocity;
		};

		/**
		 * Gets or sets the position
		 */
		this.p = function(param) {
			if (param != null) {
				this._position = param;
			}
			Graphics.setPosition(this, param);
			return this._position;
		};

		this.destroy = function() {
			this.destroyed = true;
			Events.trigger(this, "EntityDestroyed");
		};
		
		this.animate = function() {
			if(++this.frame >= this.animationFrames) {
				this.frame = 0;
				if(this.tempAnimation != null) {
					this.tempAnimation = null;
				}
			}
			Graphics.updateSprite(this);
		};
		
		this.animation = function(row) {
			this.animation = row;
			this.frame = 0;
			Graphics.updateSprite(this);
		};
		
		this.animationOnce = function(row) {
			this.tempAnimation = row;
			this.frame = 0;
			Graphics.updateSprite(this);
		};
	};

	return entity;
});