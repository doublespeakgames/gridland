define(['app/action/action'], function(Action) {
	
	var Slide = function(options) {
		this.flipped = options && options.flipped;
	};
	Slide.prototype = new Action();
	Slide.constructor = Slide;
	
	Slide.prototype.doAction = function(entity) {
		var _entity = entity;
		var G = require('app/graphics/graphics');
		G.animateMove(
			entity,
			this.flipped ? G.worldWidth() - 10 : 10,
			function() {
				_entity.action = null;
			},
			null,
			1
		);
	};
	
	Slide.prototype.terminateAction = function(entity, force) {
		if(force) {
			Action.prototype.terminateAction.call(this);
		}
	};
	
	return Slide;
});