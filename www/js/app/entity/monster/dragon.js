define(['app/entity/monster/monster', 'app/action/actionfactory'], 
		function(Monster, ActionFactory) {
	
	var postureSpeedStylesheet = null;
	
	var headMount = { x: 20, y: 97 };
	var posture = {
		stretch: [[0, -10], [0, -10], [0, -10], [0, -40]],
		idle: [[80, -10], [15, -10], [-50, -10], [-50, -40]],
		windup: [[100, -14], [20, -14], [-100, -10], [-19, -40]],
		roar: [[40, -14], [0, -14], [0, -14], [-22, -43]]
	};
	
	function setSegmentPosture(segment, pos) {
		segment.css('transform', 'rotate(' + pos[0] + 'deg) translateX(' + pos[1] + 'px)');
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
			this._segments.push(G.make('neck').appendTo(this._el));
			this._segments.push(G.make('neck').appendTo(this._segments[0]));
			this._segments.push(G.make('neck').appendTo(this._segments[1]));
			this._segments.push(G.make('head').appendTo(this._segments[2]));
		}
		return this._el;
	};
	
	Dragon.prototype.setNeckMount = function(pos) {
		pos = pos || headMount;
		this._segments[0].css({
			top: pos.y + 'px',
			left: pos.x + 'px'
		});
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
			for(var i = this._segments.length - 1; i >= 0; i--) {
				setSegmentPosture(this._segments[i], pos[i]);
				headPos = rotate(translate(headPos, pos[i][1], 0), pos[i][0]);
			}
			var dragonPos = this.el().position();
			require('app/graphics/graphics').get('.dragonTest').css({ 
				top: (headMount.y + dragonPos.top + headPos.y) + 'px', 
				left: (headMount.x + dragonPos.left + headPos.x) + 'px'
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