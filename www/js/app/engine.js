define(['jquery', 'app/graphics', 'app/gameboard', 'app/events'], function($, Graphics, GameBoard, Events) {

	return {
		activeTile: null,
		mouse: {x: 0, y: 0},
		
		options: {},
		init: function(opts) {
			$.extend(this.options, opts);
			
			// Bind mouse events
			$('document').mousemove(this.mouseMove);
			$('document').mouseup(this.mouseUp);
		},
		
		startDrag: function(tile) {
			if(GameBoard.fallingTiles > 0) return;
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
		},
		
		bindTile: function(tile) {
			var _engine = this;
			tile.el().mousedown(function() {_engine.startDrag(tile); return false;});
			tile.el().mouseup(function() {_engine.endDrag(tile); return false;});
		}
	};
});