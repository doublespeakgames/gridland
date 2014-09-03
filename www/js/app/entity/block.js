define(['app/entity/worldentity', 'app/gamecontent'], function(WorldEntity, Content) {
	
	var Block = function(options) {
		this.options = $.extend({}, this.options, {
			type: Content.ResourceType.Grain
		}, options);
		this._quantity = 0;
	};
	Block.prototype = new WorldEntity({
		className: 'block'
	});
	Block.constructor = Block;
	
	Block.makeBlock = function(savedBlock) {
		var block = new Block(savedBlock.options);
		block._quantity = savedBlock._quantity;
		
		return block;
	};
	
	Block.prototype.el = function() {
		var G = require('app/graphics/graphics');
		if(this._el == null) {
			this._el = WorldEntity.prototype.el.call(this).addClass(this.options.type.className).append(G.make());
		}
		return this._el;
	};
	
	Block.prototype.max = 30;
	
	Block.prototype.spaceLeft = function() {
		return this.max - this._quantity;
	};
	
	Block.prototype.quantity = function(value) {
		if(value != null) {
			var G = require('app/graphics/graphics');
			this._quantity = value > this.max ? this.max : value;
			G.updateBlock(this);
		}
		return this._quantity;
	};
	
	return Block;
});