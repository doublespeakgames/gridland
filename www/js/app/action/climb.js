define(['app/action/action'], function(Action) {
	
	var Climb = function(options) {
		if(options) {
			this.target = options.target;
		}
	};
	Climb.prototype = new Action();
	Climb.constructor = Climb;
	
	Climb.prototype.doAction = function(entity) {
		this._entity = entity;
		entity.animationOnce(7);
	};
	
	Climb.prototype.doFrameAction = function(frame) {
		if(frame == 0 && this.complete) {
			this._entity.action = null;
		} else if(frame == 3) {
			this.complete = true;
		}
	};
	
	return Climb;
});