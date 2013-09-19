define(['app/entity/entity', 'app/graphics', 'app/gamecontent'], function(Entity, Graphics, Content) {
	
	var tile = function(options) {
		this.options = $.extend({}, this.options, {
			type: Content.ResourceType.Grain,
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
			var el = this._el = Entity.prototype.el.call(this)
			.addClass(this.options.type.className)
			.append(Graphics.newElement('litBorder daySide'))
			.append(Graphics.newElement('litBorder nightSide'));
			
			el.data("tile", this);
		}
		return this._el;
	};
	
	tile.prototype.isAdjacent = function(other) {
		return Math.abs(this.options.row - other.options.row) + 
			Math.abs(this.options.column - other.options.column) == 1;
	};
	
	return tile;
});