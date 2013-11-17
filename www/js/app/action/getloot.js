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
				entity.animation(0);
				_action.getting = true;
			});
		});
	};
	
	GetLoot.prototype.doFrameAction = function(frame) {
		if(this.getting && frame == 3) {
			var _this = this;
			require(['app/world'], function(W) {
				EventManager.trigger('pickupLoot', [_this.target]);
				_this.target.looted = true;
				_this._entity.action = null;
			});
		}
	};
	
	return GetLoot;
});