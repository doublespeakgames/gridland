define(function() {
	
	var Action = function() {};
	Action.prototype.doAction = function(dude) {
		throw "Abstract Action cannot be executed!";
	};
	
	Action.prototype.terminateAction = function(dude) {
		var G = require('app/graphics/graphics');
		dude.makeIdle();
		G.stop(dude);
		dude.action = null;	
	};
	
	Action.prototype.doFrameAction = function(frame) {
		// Implement as needed in child actions
	};

	Action.prototype.reinitialize = function(dude) {
		console.log('reinitialize Action');
		this.terminateAction(dude);
		this.doAction(dude);
	}
	
	return Action;
});
