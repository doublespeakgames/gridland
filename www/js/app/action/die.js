define(['app/action/action'], function(Action) {
	
	var Die = function(options) {};
	Die.prototype = new Action();
	Die.constructor = Die;
	
	Die.prototype.doAction = function(entity) {
		this._entity = entity;
		entity.animationOnce(entity.lastDir == "left" ? 6 : 5);
	};
	
	Die.prototype.doFrameAction = function(frame) {
		if(frame == 3) {
			this._entity.dead = true;
		}
		if(frame == 0 && this._entity.dead) {
			this._entity.action = null;
			this._entity.el().remove();
			this._entity.gone = true;
		}
	};
	
	return Die;
});