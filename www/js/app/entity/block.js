define(['app/entity/worldentity', 'app/resources', 'app/graphics'], function(WorldEntity, Resources, Graphics) {
	
	var block = function(options) {
		this.options = $.extend({}, this.options, {
			type: Resources.Type.Grain
		}, options);
		this._quantity = 0;
	};
	block.prototype = new WorldEntity({
		className: 'block'
	});
	block.constructor = block;
	
	block.prototype.el = function() {
		if(this._el == null) {
			this._el = WorldEntity.prototype.el.call(this).addClass(this.options.type.className).append(Graphics.newElement());
		}
		return this._el;
	};
	
	block.prototype.max = 15;
	
	block.prototype.spaceLeft = function() {
		return this.max - this._quantity;
	};
	
	block.prototype.quantity = function(value) {
		if(value != null) {
			this._quantity = value > this.max ? this.max : value;
			Graphics.updateBlock(this);
		}
		return this._quantity;
	};
	
	return block;
});