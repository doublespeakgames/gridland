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
			GameState.stores.push(block);
			EventManager.trigger("addResource", [block]);
			this.checkMaximum();
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
						// Create a new block
						block = new Block({
							type: type
						});
						GameState.stores.push(block);
						// If the stores are full, eject the oldest
						Resources.checkMaximum();
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

		checkMaximum: function() {
			 if(GameState.stores.length > this.max()) {
				 var oldBlocks = GameState.stores.splice(0, GameState.stores.length - this.max());
					 for(var i in oldBlocks) {
					 oldBlocks[i].gone = true;
					 oldBlocks[i].el().remove();
				 }
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
