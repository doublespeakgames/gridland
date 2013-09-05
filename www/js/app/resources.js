define(['jquery', 'app/graphics', 'app/gamecontent', 'app/gamestate'], function($, Graphics, Content) {
	return {
		options : {},
		init : function(opts) {
			$.extend(this.options, opts);
			Graphics.addToWorld(this);
			this.el().css('opacity', 0).animate({'opacity': 1}, 200);
			this.loaded = true;
		},

		el : function() {
			if (this._el == null) {
				this._el = Graphics.newElement("resources");
			}
			return this._el;
		},
		
		collectResource: function(type, quantity) {
			if(this.loaded) {
				require(['app/entity/block', 'app/resources', 'app/gamestate'], function(Block, Resources, GameState) {
					// Find a block to fill 
					var block = null;
					for(var i = 0, len = GameState.stores.length; i < len; i++) {
						var currentBlock = GameState.stores[i];
						if(currentBlock.options.type == type && currentBlock.spaceLeft() > 0) {
							block = currentBlock;
							break;
						}
					}
					if(block == null) {
						// Create a new block
						block = new Block({
							type: type
						});
						// If the stores are full, eject the oldest
						if(GameState.stores.length >= Resources.max()) {
							var oldBlock = GameState.stores.splice(0, 1)[0];
							oldBlock.el().remove();
						}
						GameState.stores.push(block);
						Graphics.addResource(block);
					}
					// Add the resource
					var remainder = quantity - block.spaceLeft();
					block.quantity(block.quantity() + quantity);
					// If there's some left over, collect the remainder
					if(remainder > 0) {
						Resources.collectResource(type, remainder);
					}
				});
			}
		},
		
		max: function() {
			return 9;
		},
		
		getType: function(className) {
			for(var c in Content.ResourceType) {
				if(className == Content.ResourceType[c].className) {
					return Content.ResourceType[c];
				}
			}
			return null;
		}
	};
});
