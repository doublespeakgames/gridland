define(['app/entity/monster/monster', 'app/action/actionfactory'], 
		function(Monster, ActionFactory) {
	
	var postureSpeedStylesheet = null;
	
	var headMount = { x: 20, y: 97 };
	var posture = {
		stretch: ['close', [0, -10], [0, -10], [0, -10], [0, -10]],
		idle: ['close', [80, -10], [15, -10], [-50, -10], [-50, -10]],
		windup: ['close', [100, -14], [20, -14], [-100, -10], [-19, -10]],
		roar: ['open', [40, -14], [0, -14], [0, -14], [-22, -8]]
	};
	
	var _headWidth = null, _headHeight = null, _width = null;
	
	function setSegmentPosture(segment, pos, flip) {
		var r = flip ? -pos[0] : pos[0];
		var t = flip ? -pos[1] : pos[1];
		segment.css('transform', 'rotate(' + r + 'deg) translateX(' + t + 'px)');
	}
	
	function rad(deg) {
	    return deg * Math.PI/180;
	}

	function rotate(v, theta) {
	    theta = rad(theta);
	    return {
	        x: v.x*Math.cos(theta) - v.y*Math.sin(theta),
	        y: v.x*Math.sin(theta) + v.y*Math.cos(theta)
	    };
	}

	function translate(v, dx, dy) {
	    return {
	        x: v.x + dx,
	        y: v.y + dy
	    };
	}
	
	var Dragon = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		this.hp(this.maxHealth());
		this.xp = 35;
		this.headFrame = 0;
		this.headState = 'close';
		
		if(!postureSpeedStylesheet) {
			var style = document.createElement('style');
			style.appendChild(document.createTextNode("")); // Stupid Webkit
			document.head.appendChild(style);
			postureSpeedStylesheet = style.sheet;
		}
	};
	Dragon.prototype = new Monster({
		monsterClass: 'dragon',
		speed: 80,
		animationFrames: 4
	});
	Dragon.constructor = Dragon;
	
	Dragon.prototype.el = function() {
		if(this._el == null) {
			var G = require('app/graphics/graphics');
			this._segments = [];
			this._el = Monster.prototype.el.call(this);
			if(this.options.flip) this._el.addClass('flip');
			this._segments.push(G.make('neck').appendTo(this._el));
			this._segments.push(G.make('neck').appendTo(this._segments[0]));
			this._segments.push(G.make('neck').appendTo(this._segments[1]));
			this._segments.push(G.make('head').appendTo(this._segments[2]));
		}
		return this._el;
	};
	
	Dragon.prototype.headHeight = function() {
		if(!_headHeight) {
			_headHeight = this._segments[3].height();
		}
		return _headHeight;
	};
	
	Dragon.prototype.headWidth = function() {
		if(!_headWidth) {
			_headWidth = this._segments[3].width();
		}
		return _headWidth;
	};
	
	Dragon.prototype.width = function() {
		if(!_width) {
			_width = this.el().width();
		}
		return _width;
	};
	
	Dragon.prototype.animate = function() {
		Monster.prototype.animate.call(this);
		
		if(this.animateHead != null && this.animateHead != this.headState) {
			if(this.animateHead == 'open' && ++this.headFrame >= 2) {
				this.animateHead = null;
				this.headState = this.animateHead;
				this.headFrame = 2;
			} else if(this.animateHead == 'close' && --this.headFrame <= 0) {
				this.animateHead = null;
				this.headState = this.animateHead;
				this.headFrame = 0;
			}
			require('app/graphics/graphics').updateSpritePos(
				this._segments[3], 
				this.headWidth() * this.headFrame, 
				this.options.flip ? this.headHeight() : 0
			);
		}
	};
	
	Dragon.prototype.animation = function(row, stopTempAnimations) {
		row += this.options.flip ? 3 : 0;
		Monster.prototype.animation.call(this, row, stopTempAnimations);
	};
	
	Dragon.prototype.animationOnce = function(row, stepFunction) {
		row += this.options.flip ? 3 : 0;
		Monster.prototype.animationOnce.call(this, row, stepFunction);
	};
	
	Dragon.prototype.setNeckMount = function(pos) {
		pos = pos || headMount;
		var css = {
			top: pos.y + 'px'
		};
		if(this.options.flip) {
			css.right = pos.x + 'px';
		} else {
			css.left = pos.x + 'px';
		}
		this._segments[0].css(css);
	};
	
	Dragon.prototype.think = function() {
		// TODO
	};
	
	Dragon.prototype.maxHealth = function() {
		return 300; // TODO
	};
	
	Dragon.prototype.getDamage = function() {
		return 0; // TODO
	};
	
	Dragon.prototype.setPosture = function(p, speed) {
		var pos = posture[p];
		if(pos) {
			if(postureSpeedStylesheet.cssRules.length > 0) {
				postureSpeedStylesheet.deleteRule(0);
			}
			if(postureSpeedStylesheet.addRule) {
				postureSpeedStylesheet.addRule(
					'.dragon .neck, .dragon .head', 
					'transition-duration: ' + speed + 'ms', 
				0);
			} else {
				postureSpeedStylesheet.insertRule(
					'.dragon .neck, .dragon .head {' +
					'transition-duration: ' + speed + 'ms; }', 
				0);
			}
			
			var headPos = { x: 0, y: 0 };
			for(var i = this._segments.length; i > 0; i--) {
				setSegmentPosture(this._segments[i - 1], pos[i], this.options.flip);
				headPos = rotate(translate(headPos, pos[i][1] * (this.options.flip ? -1 : 1), 0), 
						pos[i][0] * (this.options.flip ? -1 : 1));
			}
			var dragonPos = this.el().position();
			this.animateHead = pos[0];
			this.headFrame = 0;
			var left;
			if(this.options.flip) {
				left = dragonPos.left + this.width() - headMount.x + headPos.x;
			} else {
				left = headMount.x + dragonPos.left + headPos.x;
			}
			require('app/graphics/graphics').get('.dragonTest').css({ 
				top: (headMount.y + dragonPos.top + headPos.y) + 'px', 
				left: left + 'px'
			});
			setTimeout(function() {
				if(postureSpeedStylesheet.cssRules.length > 0) {
					postureSpeedStylesheet.deleteRule(0);
				}
			}, speed);
		}
	};
	
	return Dragon;
});