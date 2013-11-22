define(function() {
	
	var Action = function() {};
	Action.prototype.doAction = function(dude) {
		throw "Abstract Action cannot be executed!";
	};
	
	Action.prototype.terminateAction = function(dude) {
		var G = require('app/graphics/graphics');
		dude.animation(0);
		G.stop(dude);
		dude.action = null;	
	};
	
	Action.prototype.doFrameAction = function(frame) {
		// Nuthin'
	};
	
	return Action;
});
