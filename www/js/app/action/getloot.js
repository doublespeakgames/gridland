define(['app/action/action', 'app/eventmanager'], function(Action, EventManager) {
	
	var GetLoot = function(options) {
		this.target = options.target;
	};
	GetLoot.prototype = new Action();
	GetLoot.constructor = GetLoot;
	
	GetLoot.prototype.doAction = function(entity) {
		var _action = this;
		this._entity = entity;
		entity.move(_action.target.p(), function(entity) {
			require(['app/graphics/graphics'], function(Graphics) {
				entity.animationOnce(10);
				_action.getting = true;
			});
		});
	};
	
	GetLoot.prototype.doFrameAction = function(frame) {
		if(this.getting && frame == 3) {
			EventManager.trigger('pickupLoot', [this.target]);
			this.target.gone = true;
			this._entity.action = null;
			this._entity.paused = true;
			var _e = this._entity;
			setTimeout(function() {
				_e.paused = false;
			}, 1500);
		}
	};
	
	GetLoot.prototype.terminateAction = function(entity) {
		Action.prototype.terminateAction.call(this, entity);
		entity.paused = false;
	};
	
	return GetLoot;
});