define(['app/events'], function(Events) {
	var entity = function() {
		/**
		 * Gets or sets the velocity
		 */
		this.v = function(param) {
			if(param != null) {
				this._velocity.r = param;
			}
			return this._velocity;
		};
		
		/**
		 * Gets or sets the position
		 */
		this.p = function(param) {
			if(param != null) {
				this._position.r = param;
			}
			return this._position;
		};
		
		this.destroy = function() {
			this.destroyed = true;
			Events.trigger(this, "EntityDestroyed");
		};
	};
	
	return entity;
});