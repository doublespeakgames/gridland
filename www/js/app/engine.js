define(['jquery', 'app/graphics', 'app/gameboard', 'app/events', 'app/gamestate', 'app/world'], 
		function($, Graphics, GameBoard, Events, GameState, World) {

	return {
		activeTile: null,
		mouse: {x: 0, y: 0},
		
		options: {},
		init: function(opts) {
			$.extend(this.options, opts);
			
			// Bind mouse events
			$('document').off().mousemove(this.mouseMove);
			$('document').off().mouseup(this.mouseUp);
			
//			$('#test').click(function() { require(['app/gameboard'], function(G) {
//				console.log("Moves available? " + G.areMovesAvailable());
//			}); });
		
			$('#test').off().click(function() { require(['app/world'], function(W) {
				W.phaseTransition();
			}); });
			
			$('.menuBtn').off().click(function() {
				require(['jquery'], function($) {
					$('.menuBar').toggleClass('open');
				});
			});
			
			// Start the game
			GameState.load();
			Graphics.init();
			GameBoard.init();
			World.init();
			GameBoard.fill();
			World.launchDude();
			
			var _engine = this;
			GameBoard.el().on("mousedown", ".tile", function() {
				var tile = $.data(this, "tile");
				_engine.startDrag(tile); 
				return false;
			});
			GameBoard.el().on("mouseup", ".tile", function() {
				var tile = $.data(this, "tile");
				_engine.endDrag(tile); 
				return false;
			});
		},
		
		startDrag: function(tile) {
			if(GameBoard.canMove()) {
				if(this.activeTile == null) {
					// Select the tile
					this.activeTile = tile;
					Graphics.selectTile(tile);		
				} else {
					// Either initiate a switch, or deselect
					var active = this.activeTile;
					this.activeTile = null;
					Graphics.deselectTile(active);
					if(tile.isAdjacent(active)) {
						GameBoard.switchTiles(active, tile);
					}
				}
			}
		},
		
		endDrag: function(tile) {
			if(this.activeTile != null) {
				var dx = tile.options.column - this.activeTile.options.column;
				dx = dx / Math.abs(dx) || 0;
				var dy = tile.options.row - this.activeTile.options.row;
				dy = dy / Math.abs(dy) || 0;
				if(Math.abs(dx) + Math.abs(dy) == 1) {
					var active = this.activeTile;
					this.activeTile = null;
					Graphics.deselectTile(active);
					try {
						var sibling = GameBoard.tiles[active.options.column + dx][active.options.row + dy];
						GameBoard.switchTiles(active, sibling);
					} catch(e) {console.log('No drag for you!');}
				}
			}
		}
	};
});