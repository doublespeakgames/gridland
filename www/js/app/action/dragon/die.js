define(['app/action/action'], function(Action) {
	
	var THRASH_SPEED = 400;
	
	var Die = function(options) {};
	Die.prototype = new Action();
	Die.constructor = Die;
	
	Die.prototype.doAction = function(entity) {
		this._entity = entity;
		entity.hostile = false;
		var dir = 'up';
		(function thrash() {
			setTimeout(thrash, THRASH_SPEED);
			entity.setPosture('thrash' + dir, THRASH_SPEED);
			dir = dir == 'up' ? 'down' : 'up';
		})();
		setTimeout(function() { entity.explode(800); }, 1500);
	};

	return Die;
});