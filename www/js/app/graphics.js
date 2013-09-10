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
		
		addResource: function(block) {
			$('.resources').append(block.el());
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
					left: tile2.options.column * width,
					top: tile2.options.row * width
				}, {
					duration: width * tile1.options.speed ,
					easing: 'linear'
				}),
				el2.animate({
					left: tile1.options.column * width,
					top: tile1.options.row * width
				}, {
					duration: width * tile2.options.speed ,
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
					entity.p(now + el.width() / 2);
				},
				complete: callback
			});
		},
		
		raiseBuilding: function(building, callback) {
			var el = building.el();
			$('.blockPile', el).animate({
				'top': '100%'
			}, {
				duration: 5000,
				easing: 'linear',
				complete: function() {
					$('.blockPile', el).empty();
				}
			});
			
			$.when(el.animate({
				'bottom': 0
			}, {
				duration: 5000,
				easing: 'linear'
			})).done(function() {
				callback(building);
			});
		},
		
		pickUpBlock: function(block) {
			block.el().appendTo('.heldBlock');
		},
		
		dropBlock: function(block, destinationBuilding) {
			block.el().appendTo($('.blockPile', destinationBuilding.el()));
			block.el().css('top', '0px');
		},
		
		updateBlock: function(block) {
			$('div', block.el()).width((block.quantity() / block.max * 100) + '%');
		},
		
		updateHealth: function(health, maxHealth) {
			var healthContainer = $('.healthContainer');
			if(healthContainer.length == 0) {
				healthContainer = $('<div>').appendTo('.gameBoard').addClass('healthContainer');
			}
			for(var i = 0, n = Math.ceil(maxHealth / 5) - healthContainer.children().length; i < n; i++) {
				$('<div>').addClass('heart').addClass('hiddenHeart').append($('<div>')
						.addClass('mask')).append($('<div>').addClass('bar')).appendTo(healthContainer);
			}
			for(var i = Math.ceil(maxHealth / 5); i > 0; i--) {
				var heart = healthContainer.children()[i - 1];
				if(health >= 5) {
					$(heart).removeClass('empty');
					$('.bar', heart).css('width', '100%');
					health -= 5;
				} else if(health > 0) {
					$(heart).removeClass('empty');
					$('.bar', heart).css('width', (health / 5 * 100) + '%');
					health = 0;
				} else {
					$(heart).addClass('empty');
					$('.bar', heart).css('width', '0%');
				}
				setTimeout(function() {
					$('.hiddenHeart').removeClass('hiddenHeart');
				}, 1000);
			}
		}
	};
});