define(['app/action/action'], function(Action) {
	
	var Die = function(options) {};
	Die.prototype = new Action();
	Die.constructor = Die;
	
	Die.prototype.doAction = function(entity) {
		this._entity = entity;
		entity.animation(entity.lastDir == "left" ? 6 : 5, true);
	};
	
	Die.prototype.doFrameAction = function(frame) {
		if(frame == 3) {
			this._entity.dead = true;
			this._entity.action = null;
			this._entity.gone = true;
		}
	};
	
	return Die;
});