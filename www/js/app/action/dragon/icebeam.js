define(['app/action/action'], function(Action) {
	
	var IceBeam = function(options) {
		if(options) {
			this.target = options.target;
		}
	};
	IceBeam.prototype = new Action();
	IceBeam.constructor = IceBeam;
	
	IceBeam.prototype.doAction = function(entity) {
		var beam = require('app/graphics/graphics').make('iceBeam');
		entity.setPosture('aimClose', 100);
		var _this = this;
		this.timeout = setTimeout(function() {
			entity.setPosture('aimOpen', 500);
			entity.getHead().append(beam);
			setTimeout(function() {
				var E = require('app/eventmanager'),
				C = require('app/gamecontent');
				E.trigger('newStateEffect', [C.StateEffects.frozen]);
			}, 800);
			setTimeout(function() {
				beam.remove();
				if(!_this.terminated) { entity.action = null; }
			}, 1000);
		}, 100);
	};
	
	IceBeam.prototype.terminateAction = function(entity) {
		this.terminated = true;
		clearTimeout(this.timeout);
		Action.prototype.terminateAction.call(this, entity);
	};

	return IceBeam;
});