define(['app/entity/monster/monster', 'app/action/actionfactory'], 
		function(Monster, ActionFactory) {
	
	var posture = {
		idle: [[80, -10], [15, -10], [-50, -10], [-50, -40]]
	};
	
	function setSegmentPosture(segment, pos) {
		segment.css('transform', 'rotate(' + pos[0] + 'deg) translateX(' + pos[1] + 'px)');
	}
	
	var Dragon = function(options) {
		this.options = $.extend({}, this.options, {}, options);
		this.hp(this.maxHealth());
		this.xp = 35;
	};
	Dragon.prototype = new Monster({
		monsterClass: 'dragon',
		speed: 80,
		animationFrames: 1 //TEMP
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
	
	Dragon.prototype.think = function() {
		// TODO
	};
	
	Dragon.prototype.maxHealth = function() {
		return 300; // TODO
	};
	
	Dragon.prototype.getDamage = function() {
		return 0; // TODO
	};
	
	Dragon.prototype.setPosture = function(p) {
		var pos = posture[p];
		if(pos) {
			this._segments.forEach(function(e, i) {
				setSegmentPosture(e, pos[i]);
			});
		}
	};
	
	return Dragon;
});