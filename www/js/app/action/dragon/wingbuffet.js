define(['app/action/action'], function(Action) {
	
	var WingBuffet = function() {
		this.state = 0;
	};
	
	WingBuffet.prototype = new Action();
	WingBuffet.constructor = WingBuffet;
	
	WingBuffet.prototype.doAction = function(entity) {
		this.entity = entity;
		entity.animationOnce(3);
	};
	
	WingBuffet.prototype.doFrameAction = function(frame) {
		if(frame == 0 && this.state == 0) {
			this.state = 1;
		} else if(frame == 0 && this.state == 1) {
			this.state = 2;
			this.entity.animationOnce(4);
		} else if(frame == 3 && this.state == 2) {
			this.entity.action = null;
		}
	};

	return WingBuffet;
});