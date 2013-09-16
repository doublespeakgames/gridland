define(function() {
	
	var Action = function() {};
	Action.prototype.doAction = function(dude) {
		throw "Abstract Action cannot be executed!";
	};
	
	Action.prototype.terminateAction = function(dude) {
		require(['app/graphics'], function(Graphics) {
			dude.animation(0);
			Graphics.stop(dude);
			dude.action = null;	
		});
	};
	
	return Action;
});
