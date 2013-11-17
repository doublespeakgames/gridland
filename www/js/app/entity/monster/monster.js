define(['app/entity/worldentity', 'app/graphics/graphics'], 
		function(WorldEntity, Graphics) {
	
	var Monster = function(options) {
		this.options = $.extend({}, this.options, options);
		this.hostile = true;
		this.action = null;
	};
	Monster.prototype = new WorldEntity({
		className: 'monster'
	});
	
	Monster.prototype.el = function() {
		if(this._el == null) {
			this._el = WorldEntity.prototype.el.call(this)
				.addClass(this.options.monsterClass)
				.append(Graphics.make('healthBar').append(Graphics.make()));
		}
		return this._el;
	};
	
	Monster.constructor = Monster;
	
	return Monster;
});