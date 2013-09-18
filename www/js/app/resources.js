define(['jquery', 'app/graphics', 'app/gamecontent', 'app/gamestate'], function($, Graphics, Content, GameState) {
	return {
		options : {},
		init : function(opts) {
			$.extend(this.options, opts);
			this._el = null;
			Graphics.hide(this);
			Graphics.addToWorld(this);
			var _g = Graphics;
			var _t = this;
			setTimeout(function() {
				_g.show(_t);
			}, 10);
			this.loaded = true;
		},

		el : function() {
			if (this._el == null) {
				this._el = Graphics.newElement("resources");
			}
			return this._el;
		},
		
		returnBlock: function(block) {
			GameState.stores.push(block);
			Graphics.addResource(block);
			this.checkMaximum();
		},
		
		collectResource: function(type, quantity) {
			if(this.loaded) {
				if(type == Content.ResourceType.Grain) {
					// TODO: Heal the dude
				} else {
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
							GameState.stores.push(block);
							// If the stores are full, eject the oldest
							Resources.checkMaximum();
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
			}
		},
		
		checkMaximum: function() {
			if(GameState.stores.length > this.max()) {
				var oldBlocks = GameState.stores.splice(0, GameState.stores.length - this.max());
				for(var i in oldBlocks) {
					oldBlocks[i].gone = true;
					oldBlocks[i].el().remove();
				}
			}
		},
		
		max: function() {
			return 9;
		}
	};
});
