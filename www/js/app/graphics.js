define(['jquery', 'jquery-ui'], function($, UI) {
	return {
		
		init: function() {
			// Nuthin for now
		},
		
		createBoard: function(rows, cols) {
			// Generate the board element
			var el = $('<div>').addClass('gameBoard').addClass('litBorder');
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
		
		hide: function(entity) {
			entity.el().addClass('hidden');
		},
		
		show: function(entity) {
			entity.el().removeClass('hidden');
		},
		
		addResource: function(block) {
			$('.resources').append(block.el());
		},
		
		addToTileContainer: function(entity) {
			$('.tileContainer').append(entity.el());
		},
		
		addMonster: function(monster, side) {
			var el = monster.el();
			el.css('left', '100%')
			el.appendTo('.world');
			if(side == 'left') {
				el.css('left', -el.width() + 'px');
			}
			monster.p(el.position().left + el.width() / 2);
		},
		
		moveCelestial: function(entity, pos) {
			var el = entity.el();
			var worldWidth = $('.world').width();
			var height = (Math.abs(pos - worldWidth / 2) / (worldWidth / 2)) * 30;
			el.css({
				left: (pos - (el.width() / 2)) + 'px',
				top: Math.floor(height) + 'px'
			});
		},
		
		phaseTransition: function(celestial) {
			celestial.el().css('top', '100%');
			var _g = this;
			setTimeout(function() {
				$('body').toggleClass('night');
				if($('body').hasClass('night')) {
					celestial.animation(1);
				} else {
					celestial.animation(0);
				}
				celestial.el().css('left', '0px');
			}, 300);
			setTimeout(function() {
				_g.raiseCelestial(celestial);
			}, 700);
		},
		
		raiseCelestial: function(celestial) {
			celestial.el().css({
				top: '100%',
				left: '0px'
			});
			celestial.p(15);
			this.moveCelestial(celestial, celestial.p());
		},
		
		updateSprite: function(entity) {
			var el = entity.el();
			var spriteRow = entity.tempAnimation == null ? entity.animationRow : entity.tempAnimation;
			el.css('background-position', -(entity.frame * el.width()) + "px " + -(spriteRow * el.height()) + 'px');
			$('.animationLayer', el).css('background-position', -(entity.frame * el.width()) + "px " + -(spriteRow * el.height()) + 'px');
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
		
		animateMove: function(entity, pos, callback, stopShort) {
			var el = entity.el();
			var dist = Math.abs(entity.p() - pos);
			el.stop().animate({
				'left': pos - (el.width() / 2)
			}, {
				duration: dist * entity.options.speed, 
				easing: 'linear', 
				step: function(now, tween) {
					entity.p(now + el.width() / 2);
					if(stopShort != null && stopShort()) {
						el.stop();
						if(callback != null) {
							callback();
						}
					}
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
				easing: 'linear'
			});
			
			el.animate({
				'bottom': 0
			}, {
				duration: 5000,
				easing: 'linear',
				complete: function() {
					callback(building);
				}
			});
		},
		
		sinkBuilding: function(building) {
			var el = building.el();
			$('.blockPile', el).stop().css('top', '-60px');
			el.stop().css('bottom', '-80px');
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
		
		getStatusContainer: function() {
			var healthContainer = $('.statusContainer');
			if(healthContainer.length == 0) {
				healthContainer =  $('<div>').appendTo('.gameBoard').addClass('statusContainer')
					.append($('<div>').addClass('hearts'));;
			}
			return healthContainer;
		},
		
		updateHealth: function(health, maxHealth) {
			
			var HEALTH_PER_HEART = 10;
			var statusContainer = $('.hearts', this.getStatusContainer());
			for(var i = 0, n = Math.ceil(maxHealth / HEALTH_PER_HEART) - statusContainer.children().length; i < n; i++) {
				$('<div>').addClass('heart').addClass('hidden').append($('<div>')
						.addClass('mask')).append($('<div>').addClass('mask')
						.addClass('nightSprite')).append($('<div>')
						.addClass('bar')).appendTo(statusContainer);
			}
			for(var i = Math.ceil(maxHealth / HEALTH_PER_HEART); i > 0; i--) {
				var heart = statusContainer.children()[i - 1];
				if(health >= HEALTH_PER_HEART) {
					$(heart).removeClass('empty');
					$('.bar', heart).css('width', '100%');
					health -= HEALTH_PER_HEART;
				} else if(health > 0) {
					$(heart).removeClass('empty');
					$('.bar', heart).css('width', (health / HEALTH_PER_HEART * 100) + '%');
					health = 0;
				} else {
					$(heart).addClass('empty');
					$('.bar', heart).css('width', '0%');
				}
			}
			setTimeout(function() {
				$('.heart.hidden').removeClass('hidden');
			}, 100);
		},
		
		updateShield: function(shield, maxShield) {
			var container = this.getStatusContainer();
			var el = $('.shield', container);
			if(el.length == 0) {
				el = $('<div>').addClass('shield').addClass('hidden')
					.append($('<div>')).insertAfter('.hearts', container);
			}
			if(shield > 0) {
				setTimeout(function() {
					el.removeClass('hidden');
				}, 100);
				$('div', el).width((shield / maxShield * 100) + "%");
			} else {
				$('div', el).width("0%");
				el.addClass('hidden');
			}
		},
		
		updateSword: function(sword, maxSword) {
			var container = this.getStatusContainer();
			var el = $('.sword', container);
			if(el.length == 0) {
				el = $('<div>').addClass('sword').addClass('hidden')
					.append($('<div>')).insertAfter('.hearts', container);
			}
			if(sword > 0) {
				setTimeout(function() {
					el.removeClass('hidden');
				}, 100);
				$('div', el).width((sword / maxSword * 100) + "%");
			} else {
				$('div', el).width("0%");
				el.addClass('hidden');
			}
		},
		
		stop: function(entity) {
			entity.el().stop();
		}
	};
});