define(['app/entity/entity'], function(Entity) {
	
	var tile = function(options) {
		$.extend(this.options, {
			type: type.Grain
		}, options);
	};
	tile.prototype = new Entity({
		className: 'tile',
		speed: 2
	});
	tile.constructor = tile;
	
	tile.prototype.el = function() {
		return Entity.prototype.el.call(this).addClass(this.options.type.className);
	};
	
	var type = tile.TYPE = {
		Grain: {
			className: 'grain'
		},
		Wood: {
			className: 'wood'
		},
		Stone: {
			className: 'stone'
		}
	};
	
	return tile;
});