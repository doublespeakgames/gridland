define(['app/entity/worldentity'], 
		function(WorldEntity) {
	
	var WorldEffect = function(className) { 
		this.className = className;
	};
	WorldEffect.prototype = new WorldEntity({
		className: 'worldEffect'
	});
	WorldEffect.constructor = WorldEffect;
	
	WorldEffect.prototype.el = function() {
		if(!this._el) {
			this._el = WorldEntity.prototype.el.call(this);
			this._el.addClass(this.className);
		}
		return this._el;
	};
	
	return WorldEffect;
});