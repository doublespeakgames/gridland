define(['app/entity/worldentity'], 
		function(WorldEntity) {
	
	var WorldEffect = function(options) {
		this.options = $.extend({}, this.options, {
			animationFrames: 1,
			effectClass: 'blank',
			row: 0
		}, options);
		this.animationRow = options.row;
	};
	WorldEffect.prototype = new WorldEntity({
		className: 'worldEffect'
	});
	WorldEffect.constructor = WorldEffect;
	
	WorldEffect.prototype.el = function() {
		if(!this._el) {
			this._el = WorldEntity.prototype.el.call(this).addClass(this.options.effectClass);
		}
		return this._el;
	};
	
	WorldEffect.prototype.think = function() {
		this.options.effect && this.options.effect();
	};
	
	return WorldEffect;
});