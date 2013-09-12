define(function() {
	
	var Action = function() {};
	Action.prototype.doAction = function(dude) {
		throw "Abstract Action cannot be executed!";
	};
	
	Action.prototype.terminateAction = function(dude) {
		throw "Abstract Action cannot be terminated!";
	};
	
	return Action;
});
