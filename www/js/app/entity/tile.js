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
		speed: 2
	});
	tile.constructor = tile;
	
	tile.prototype.el = function() {
		if(this._el == null) {
			this._el = Entity.prototype.el.call(this).addClass(this.options.type.className).append($('<div>'));
		}
		return this._el;
	};
	
	tile.prototype.isAdjacent = function(other) {
		return Math.abs(this.options.row - other.options.row) + 
			Math.abs(this.options.column - other.options.column) == 1;
	};
	
	tile.getType = function(className) {
		for(var c in this.TYPE) {
			if(className == this.TYPE[c].className) {
				return this.TYPE[c];
			}
		}
		return null;
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
		},
		Clay: {
			className: 'clay'
		},
		Gem: {
			className: 'gem'
		},
		Blank: {
			className: 'blank'
		}
	};
	
	return tile;
});