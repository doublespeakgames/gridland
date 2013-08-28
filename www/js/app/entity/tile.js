define(['app/entity/entity'], function(Entity) {
	
	var tile = function(options) {
		this.options = $.extend({}, this.options, {
			type: type.Grain,
			row: null,
			column: null
		}, options);
	};
	tile.prototype = new Entity({
		className: 'tile',
		speed: 1
	});
	tile.constructor = tile;
	
	tile.prototype.el = function() {
		return Entity.prototype.el.call(this).addClass(this.options.type.className);
	};
	
	tile.prototype.isAdjacent = function(other) {
		return Math.abs(this.options.row - other.options.row) + 
			Math.abs(this.options.column - other.options.column) == 1;
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