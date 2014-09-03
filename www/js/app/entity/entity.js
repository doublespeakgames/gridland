define([ 'jquery' ], function($) {
	
	var entity = function(options) {
		
		this.options = $.extend({
			className: "blank",
			animationFrames: 4,
			speed: 40
		}, options);
		
		this.frame = 0;
		this.animationRow = 0;
		this.tempAnimation = null;
		this.stepFunction = null;
	};
	
	entity.prototype.guid = function() {
		if(!this._guid) {
			this._guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			    return v.toString(16);
			});
		}
		return this._guid;
	};

	/**
	 * Gets the html element for this Entity, creating it if necessary
	 */
	entity.prototype.el = function() {
		if(this._el == null) {
			var G = require('app/graphics/graphics');
			this._el = G.make(this.options.className);
		}
		return this._el;
	};
	
	entity.prototype.width = function() {
		if(!this._width) {
			this._width = this.el().width();
		}
		return this._width;
	};
	
	entity.prototype.height = function() {
		if(!this._height) {
			this._height = this.el().height();
		}
		return this._height;
	};

	/**
	 * Gets or sets the position
	 */
	entity.prototype.p = function(param) {
		if (param != null) {
			this._position = param;
		}
		return this._position;
	};

	entity.prototype.destroy = function() {
		this.destroyed = true;
		Events.trigger(this, "EntityDestroyed");
	};
	
	entity.prototype.animate = function() {
		if(++this.frame >= this.options.animationFrames) {
			this.frame = 0;
			if(this.tempAnimation != null) {
				this.tempAnimation = null;
				this.stepFunction = null;
			}
		}
		var G = require('app/graphics/graphics');
		G.updateSprite(this);
	};
	
	entity.prototype.animation = function(row, stopTempAnimations, stepFunction) {
		if(stopTempAnimations) {
			this.tempAnimation = null;
			this.stepFunction = null;
		}
		if(stepFunction) {
			this.stepFunction = stepFunction;
		}
		this.animationRow = row;
		this.frame = 0;
		var G = require('app/graphics/graphics');
		G.updateSprite(this);
	};
	
	entity.prototype.animationOnce = function(row, stepFunction) {
		this.tempAnimation = row;
		this.frame = 0;
		var G = require('app/graphics/graphics');
		this.stepFunction = stepFunction || null;
		G.updateSprite(this);
	};
	
	entity.prototype.speed = function() {
		return this.options.speed;
	};

	return entity;
});