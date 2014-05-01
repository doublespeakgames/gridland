define(['app/action/action'], function(Action) {
	
	var WingBuffet = function(options) {
		this.state = 0;
		this.target = options ? options.target : null;
	};
	
	WingBuffet.prototype = new Action();
	WingBuffet.constructor = WingBuffet;
	
	WingBuffet.prototype.doAction = function(entity) {
		this.entity = entity;
		entity.animationOnce(3);
	};
	
	WingBuffet.prototype.doFrameAction = function(frame) {
		if(frame == 0) {
			if(this.state == 0) {
				this.state = 1;
			} else if(this.state == 1) {
				this.state = 2;
				this.entity.animationOnce(4);
			} else if(this.state == 2) {
				this.entity.action = null;
				this.state = 3;
			}
		} else if(frame == 3 && this.state == 1) {
			require('app/eventmanager').trigger('flap');
			if(!require('app/world').hasEffect('frozen')) {
				this.target.action && this.target.action.terminateAction(this.target);
				this.target.action = require('app/action/actionfactory')
					.getAction('Slide', { flipped: this.entity.options.flip });
				this.target.action.doAction(this.target);
			}
			require('app/world').removeAllEffects('fire');
		}
		adjustHead(this.entity, this.state, frame);
	};
	
	function adjustHead(e, state, frame) {
		if(state == 1) {
			switch(frame) {
			case 0:
				return e.setNeckMount({ x: 25, y: 105 });
			case 1:
				return e.setNeckMount({ x: 37, y: 65 });
			case 2:
			case 3:
				return e.setNeckMount({ x: 65, y: 46 });
			}
		} else if(state == 2) {
			switch(frame) {
			case 0:
				return e.setNeckMount({ x: 65, y: 70 });
			case 1:
				return e.setNeckMount({ x: 30, y: 80 });
			case 2:
				return e.setNeckMount();
			case 3:
				return e.setNeckMount({ x: 25, y: 105 });
			}
		} else {
			e.setNeckMount();
		}
	}

	return WingBuffet;
});