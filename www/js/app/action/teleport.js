define(['app/action/action'], function(Action) {
	
	var Teleport = function(options) {
		if(options) {
			this.target = options.target;
		}
	};
	Teleport.prototype = new Action();
	Teleport.constructor = Teleport;
	
	Teleport.prototype.doAction = function(entity) {
		this._entity = entity;
		entity.animationOnce(entity.getAnimation(entity.lastDir));
	};
	
	Teleport.prototype.doFrameAction = function(frame) {
		switch(frame) {
		case 0:
			// vanish
			this._entity.el().addClass('hidden');
			this._entity.hidden = true;
			require('app/eventmanager').trigger('teleport');
			break;
		case 2:
			// move
			var G = require('app/graphics/graphics');
			var w = G.worldWidth();
			if(this.target.p() < w / 2) {
				// Teleport right
				this._entity.p(w - 30);
			} else {
				// Teleport left
				this._entity.p(30);
			}
			G.setPosition(this._entity, this._entity.p());
			break;
		case 3:
			// reappear
			this._entity.el().removeClass('hidden');
			this._entity.hidden = false;
			this._entity.action = null;
			break;
		}
	};
	
	Teleport.prototype.terminateAction = function(entity) {
		entity.el().removeClass('hidden');
		entity.hidden = false;
		Action.prototype.terminateAction.call(this, entity);
	};
	
	return Teleport;
});