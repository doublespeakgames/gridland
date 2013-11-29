define(['jquery', 'app/eventmanager', 'app/analytics', 'app/graphics/graphics', 
        'app/gamecontent', 'app/gameboard', 'app/gamestate', 'app/world', 'app/loot', 'app/magic', 'app/gameoptions'], 
		function($, EventManager, Analytics, Graphics, Content, GameBoard, GameState, World, Loot, Magic, Options) {

	return {
		DRAG_THRESHOLD: 30, // in pixels
		activeTile: null,
		dragging: false,
		dragStart: {x: 0, y: 0},
		
		options: {},
		init: function(opts) {
			$.extend(this.options, opts);
		
			$('#test').off().click(function() { require(['app/world'], function(W) {
				W.phaseTransition();
			}); });
			
			$('.menuBtn').off().on("click touchstart", function() {
				require(['jquery'], function($) {
					$('.menuBar').toggleClass('open');
				});
			});
			
			// Start the game
			EventManager.init();
			Analytics.init();
			GameState.load();
			GameBoard.init();
			Graphics.init();
			World.init();
			Loot.init();
			Magic.init();
			GameBoard.fill();
			World.launchDude();
			
			var _engine = this;
			Graphics.attachHandler("GameBoard", "mousedown touchstart", '.tile', function(e) {
				if(!_engine.dragging) {
					// Handle wacky touch event objects
					if(e.originalEvent.changedTouches) {
						e = e.originalEvent.changedTouches[0];
					}
					_engine.dragStart.x = e.clientX;
					_engine.dragStart.y = e.clientY;
					_engine.dragging = true;
					var tile = $.data(this, "tile");
					_engine.startDrag(tile);
				}
				EventManager.trigger('toggleMenu');
				return false;
			});
			Graphics.attachHandler("GameBoard", "mouseup touchend", function(e) {
				if(_engine.dragging) {
					_engine.dragging = false;
					// Handle wacky touch event objects
					if(e.originalEvent.changedTouches) {
						e = e.originalEvent.changedTouches[0];
					}
					_engine.endDrag({ 
						x: e.clientX - _engine.dragStart.x,
						y: e.clientY - _engine.dragStart.y
					});
				}
				return false;
			});
			Graphics.attachHandler("GameBoard", "mousedown touchstart", ".inventory .button", function(e) {
				// Handle wacky touch event objects
				if(e.originalEvent.changedTouches) {
					e = e.originalEvent.changedTouches[0];
				}
				EventManager.trigger('toggleMenu');
				Loot.useItem($(e.target).closest('.button').data('lootName'));
				return false;
			});
			Graphics.attachHandler("GameBoard", "mousedown touchstart", ".magic .button", function(e) {
				// Handle wacky touch event objects
				if(e.originalEvent.changedTouches) {
					e = e.originalEvent.changedTouches[0];
				}
				EventManager.trigger('magicClick', [$(e.target)]);
				return false;
			});
			$('body').off().on('mousedown touchstart', function(e) {
				EventManager.trigger('toggleMenu');
				return false;
			});
			Graphics.attachHandler("World", "mousedown touchstart", function(e) {
				// Handle wacky touch event objects
				if(e.originalEvent.changedTouches) {
					e = e.originalEvent.changedTouches[0];
				}
				EventManager.trigger('toggleMenu');
				EventManager.trigger('toggleCosts', [true]);
				return false;
			});
			Graphics.attachHandler("World", "mouseup touchend", function(e) {
				// Handle wacky touch event objects
				if(e.originalEvent.changedTouches) {
					e = e.originalEvent.changedTouches[0];
				}
				EventManager.trigger('toggleCosts', [false]);
				return false;
			});
		},
		
		_debug: function(text) {
			$('#debug').text(text);
		},
		
		canMove: function() {
			return GameBoard.dropCount == 0 && GameBoard.removals == 0 && !World.inTransition;
		},
		
		startDrag: function(tile) {
			if(this.canMove()) {
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
		
		endDrag: function(delta) {
			if(this.activeTile != null) {
				var dx = delta.x / this.DRAG_THRESHOLD;
				dx = dx < 0 ? Math.ceil(dx) : Math.floor(dx);
				dx = dx / Math.abs(dx) || 0;
				var dy = delta.y / this.DRAG_THRESHOLD;
				dy = dy < 0 ? Math.ceil(dy) : Math.floor(dy);
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