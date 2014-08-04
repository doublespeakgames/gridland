define(['jquery', 'app/eventmanager', 'app/gamecontent', 'app/gamestate'], 
		function($, EventManager, Content, GameState) {
	var Resources = {
		options : {
			rows: 3,
			cols: 3
		},
		init : function(opts) {
			$.extend(this.options, opts);
			this.loaded = true;
			EventManager.trigger('resourceInit');
		},
		
		returnBlock: function(block) {
			// If the stores are now full, we can't return the block
			if(GameState.stores.length >= Resources.max()) {
				block.el().remove();
				return;
			}
			GameState.stores.push(block);
			EventManager.trigger("addResource", [block]);
		},
		
		collectResource: function(type, quantity) {
			if(this.loaded) {
				require(['app/entity/block'], 
						function(Block) {
					// Find a block to fill 
					var block = null;
					for(var i = 0, len = GameState.stores.length; i < len; i++) {
						var currentBlock = GameState.stores[i];
						if(currentBlock.options.type.className == type.className && currentBlock.spaceLeft() > 0) {
							block = currentBlock;
							break;
						}
					}
					if(block == null) {
						// If the stores are full, we can't create a new block
						if(GameState.stores.length >= Resources.max()) return;

						// Create a new block
						block = new Block({
							type: type
						});
						GameState.stores.push(block);
						EventManager.trigger("addResource", [block]);
					}
					// Add the resource
					var remainder = quantity - block.spaceLeft();
					GameState.count('GATHERED', quantity > block.spaceLeft() ? block.spaceLeft() : quantity);
					block.quantity(block.quantity() + quantity);
					// If there's some left over, collect the remainder
					if(remainder > 0) {
						Resources.collectResource(type, remainder);
					}
				});
			}
		},

		setSize: function(rows, cols) {
			this.options.rows = rows;
			this.options.cols = cols;
		},
		
		max: function() {
			return this.options.cols * this.options.rows;
		}
	};


	return Resources;
});
