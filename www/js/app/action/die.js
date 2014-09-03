define(['app/action/action'], function(Action) {
	
	var CORPSE_DECAY_TIME = 5000;

	var Die = function(options) {};
	Die.prototype = new Action();
	Die.constructor = Die;
	
	Die.prototype.doAction = function(entity) {
		this._entity = entity;
		entity.animation(entity.lastDir == "left" ? 6 : 5, true);
		require('app/eventmanager').trigger('death');
	};
	
	Die.prototype.doFrameAction = function(frame) {
		if(frame == 3) {
			this._entity.dead = true;
			this._entity.action = null;
			this._entity.gone = true;
			setTimeout((function() {
				setTimeout((function() {
					this._entity.el().remove();
				}).bind(this), 200);
				this._entity.el().addClass('hidden');
			}).bind(this), CORPSE_DECAY_TIME);
		}
	};
	
	Die.prototype.terminateAction = function(entity, force) {
		return false;
	};
	
	return Die;
});