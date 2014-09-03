define(['app/entity/worldentity'], function(WorldEntity) {
	
	var Projectile = function(options) {
		this.options = $.extend({}, this.options, options);
	};
	Projectile.prototype = new WorldEntity({
		className: 'projectile'
	});
	Projectile.constructor = Projectile;
	
	Projectile.prototype.el = function() {
		if(this._el == null) {
			var Graphics = require('app/graphics/graphics');
			this._el = WorldEntity.prototype.el.call(this)
				.addClass(this.options.projectileClass)
				.append(Graphics.make('projectileInner'));
		}
		return this._el;
	};
	
	return Projectile;
});