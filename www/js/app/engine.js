define(['jquery', 'app/eventmanager', 'app/analytics', 'app/graphics/graphics', 
        'app/gamecontent', 'app/gameboard', 'app/gamestate', 'app/world', 'app/loot', 'app/magic', 'app/gameoptions'], 
		function($, EventManager, Analytics, Graphics, Content, GameBoard, GameState, World, Loot, Magic, Options) {

	var DRAG_THRESHOLD = 30; // in pixels
	var activeTile = null;
	var dragging = false;
	var dragStart = {x: 0, y: 0};
	var graphicsCallback = null;
	
	function initializeModules(modules, callback) {
		// init all modules passed to me
		var module = null;
		(function initModule() {
			if(module == null) {
				if(modules.length == 0) {
					return callback();
				} else {
					module = modules.shift();
					module.init();
				}
			}
			if(isReady(module)) {
				module = null;
				initModule();
			} else {
				setTimeout(initModule, 50);
			}
		})();
	}
	
	function isReady(module) {
		if(typeof module.isReady == 'function'){
			return module.isReady();
		}
		if(module.isReady != null) {
			return module.isReady;
		}
		return true;
	}
	
	function canMove() {
		return graphicsCallback == null && GameBoard.canMove() && World.canMove();
	}
	
	function startDrag(tile) {
		if(canMove()) {
			if(activeTile == null) {
				// Select the tile
				activeTile = tile;
				Graphics.selectTile(tile);		
			} else {
				// Either initiate a switch, or deselect
				var active = activeTile;
				activeTile = null;
				Graphics.deselectTile(active);
				if(tile.isAdjacent(active)) {
					GameBoard.switchTiles(
						{row: active.options.row, col: active.options.column}, 
						{row: tile.options.row, col: tile.options.column}
					);
				}
			}
		}
	}
	
	function endDrag(delta) {
		if(activeTile != null) {
			var dx = delta.x / DRAG_THRESHOLD;
			dx = dx < 0 ? Math.ceil(dx) : Math.floor(dx);
			dx = dx / Math.abs(dx) || 0;
			var dy = delta.y / DRAG_THRESHOLD;
			dy = dy < 0 ? Math.ceil(dy) : Math.floor(dy);
			dy = dy / Math.abs(dy) || 0;
			if(Math.abs(dx) + Math.abs(dy) == 1) {
				var active = activeTile;
				activeTile = null;
				Graphics.deselectTile(active);
				if(active.options.row + dy >= 0 && active.options.row + dy < GameBoard.options.rows &&
				   active.options.column + dx >= 0 && active.options.column + dx < GameBoard.options.columns) {
					GameBoard.switchTiles(
						{row: active.options.row, col: active.options.column}, 
						{row: active.options.row + dy, col: active.options.column + dx}
					);
				}
			}
		}
	}
	
	function handleGraphicsComplete() {
		if(typeof graphicsCallback == 'function') {
			var cb = graphicsCallback;
			graphicsCallback = null;
			cb();
		}
	}
	
	var Engine = {
		options: {},
		init: function(opts) {
			$.extend(this.options, opts);
		
			$('#test').off().click(function() { 
				EventManager.trigger('phaseChange');
			});
			
			$('.menuBtn').off().on("click touchstart", function() {
				require(['jquery'], function($) {
					$('.menuBar').toggleClass('open');
				});
			});
			
			// Start the game
			GameState.load();
			initializeModules([
				EventManager,
				Analytics,
				GameBoard,
				Graphics,
				World,
				Loot,
				Magic
			], function() {
				EventManager.bind('graphicsActionComplete', handleGraphicsComplete);
				EventManager.trigger('refreshBoard');
				EventManager.trigger('launchDude');
			});
			
			Graphics.attachHandler("GameBoard", "mousedown touchstart", '.tile', function(e) {
				if(!dragging) {
					// Handle wacky touch event objects
					if(e.originalEvent.changedTouches) {
						e = e.originalEvent.changedTouches[0];
					}
					dragStart.x = e.clientX;
					dragStart.y = e.clientY;
					dragging = true;
					var tile = $.data(this, "tile");
					startDrag(tile);
				}
				EventManager.trigger('toggleMenu');
				return false;
			});
			Graphics.attachHandler("GameBoard", "mouseup touchend", function(e) {
				if(dragging) {
					dragging = false;
					// Handle wacky touch event objects
					if(e.originalEvent.changedTouches) {
						e = e.originalEvent.changedTouches[0];
					}
					endDrag({ 
						x: e.clientX - dragStart.x,
						y: e.clientY - dragStart.y
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
			Graphics.attachHandler("World", "mousedown touchstart", '.blockPile', function(e) {
				// Handle wacky touch event objects
				if(e.originalEvent.changedTouches) {
					e = e.originalEvent.changedTouches[0];
				}
				EventManager.trigger('prioritizeBuilding', [$(e.target).closest('.blockPile').data('building')]);
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
		
		setGraphicsCallback: function(cb) {
			if(graphicsCallback != null) throw "Already waiting on graphics!";
			graphicsCallback = cb;
		},
		
		isNight: function() {
			return World.isNight();
		},
		
		_debug: function(text) {
			$('#debug').text(text);
		}
	};
	
	return Engine;
});