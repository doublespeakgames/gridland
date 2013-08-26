define(['jquery', 'jquery-ui'], function($, UI) {
	return {
		
		init: function() {
			// Nuthin for now
		},
		
		createBoard: function(rows, cols) {
			// Generate the board element
			var el = $('<div>').addClass('gameBoard');
			$('<div>').addClass('tileContainer').appendTo(el);
			// Determine the board dimensions based on the size of the tiles
			var testTile = $('<div>').addClass('tile').hide().appendTo('body');
			el.width(testTile.width() * cols);
			el.height(testTile.height() * rows);
			testTile.remove();
			return el;
		},
		
		newElement: function(className) {
			return $('<div>').addClass(className);
		},
		
		addToWorld: function(entity) {
			$('.world').append(entity.el());
		},
		
		addToScreen: function(entity) {
			$('body').append(entity.el());
		},
		
		addToBoard: function(entity) {
			$('.gameBoard').append(entity.el());
		},
		
		addToTileContainer: function(entity) {
			$('.tileContainer').append(entity.el());
		},
		
		updateSprite: function(entity) {
			var el = entity.el();
			var spriteRow = entity.tempAnimation == null ? entity.animationRow : entity.tempAnimation;
			el.css('background-position', -(entity.frame * el.width()) + "px " + -(spriteRow * el.height()) + 'px');
		},
		
		setPosition: function(entity, pos) {
			var el = entity.el();
			el.css('left', (pos - (el.width() / 2)) + "px");
		},
		
		setPositionInBoard: function(entity, row, column) {
			var el = entity.el();
			var top = row * el.height();
			el.css({
				left: el.width() * column,
				top: el.height() * row
			});
		},
		
		dropTile: function(tile, toRow, callback) {
			var el = tile.el();
			var finalTop = toRow * el.height();
			var dist = Math.abs(el.position().top - finalTop);
			
			el.animate({
				top: finalTop
			}, {
				duration: dist * tile.options.speed,
				// easing: "easeOutBounce",
				easing: "easeInQuad",
				complete: callback
			});
		},
		
		switchTiles: function(tile1, tile2, callback) {
			var el1 = tile1.el(), el2 = tile2.el();
			var width = el1.width();
			$.when(
				el1.animate({
					left: tile2.column * width,
					top: tile2.row * width
				}, {
					duration: width * tile1.options.speed,
					easing: 'linear'
				}),
				el2.animate({
					left: tile1.column * width,
					top: tile1.row * width
				}, {
					duration: width * tile2.options.speed,
					easing: 'linear'
				})
			).done(function() {
				callback(tile1, tile2);
			});
		},
		
		selectTile: function(tile) {
			tile.el().addClass('selected');
		},
		
		deselectTile: function(tile) {
			tile.el().removeClass('selected');
		},
		
		removeTiles: function(tiles, callback) {
			for(var t in tiles) {
				var tile = tiles[t];
				if(tile != null) {
					tile.el().addClass('removing');
				}
			}
			$.when($('.removing').animate({
				opacity: 0
			}, {
				duration: 200,
				easing: 'linear'
			})).done(function() {
				console.log('callback');
				for(var t in tiles) {
					var tile = tiles[t];
					if(tile != null) {
						tile.el().remove();
					}
				}
				callback(tiles);
			});
		},
		
		animateMove: function(entity, pos, callback) {
			var el = entity.el();
			var dist = Math.abs(entity.p() - pos);
			el.stop().animate({
				'left': pos - (el.width() / 2)
			}, {
				duration: dist * entity.options.speed, 
				easing: 'linear', 
				step: function(now, tween) {
					entity.p(now);
				},
				complete: callback
			});
		}
	};
});