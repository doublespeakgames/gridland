define(['jquery', 'app/eventmanager', 'app/textStore'], function($, EventManager, TextStore) {
	return {
		BOARD_PAD: 2,
		init: function() {
			$('body').removeClass('night');
			
			this.textStore = new TextStore();
			
			EventManager.bind('healthChanged', this.updateHealthBar);
			EventManager.bind('dayBreak', this.handleDayBreak);
		},
		
		clearBoard: function() {
			$('.gameBoard').remove();
		},
		
		createBoard: function(rows, cols) {
			// Generate the board element
			var el = $('<div>').addClass('gameBoard').addClass('litBorder');
			$('<div>').addClass('tileContainer').attr('id', 'tileContainer').appendTo(el);
			// Determine the board dimensions based on the size of the tiles
			var testTile = $('<div>').addClass('tile').hide().appendTo('body');
			this.TILE_WIDTH = testTile.width();
			this.TILE_HEIGHT = testTile.height();
			el.width(this.TILE_WIDTH * cols);
			el.height(this.TILE_HEIGHT * rows);
			testTile.remove();
			return el;
		},
		
		newElement: function(className) {
			return $('<div>').addClass(className);
		},
		
		addToWorld: function(entity) {
			$('.world').append(entity.el());
			this.updateSprite(entity);
		},
		
		worldWidth: function() {
			return $('.world').width();
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
		
		addTilesToContainer: function(entities) {
			var elements = document.createDocumentFragment();
			for(var e in entities) {
				elements.appendChild(entities[e].el()[0]);
			}
			document.getElementById('tileContainer').appendChild(elements);
		},
		
		addMonster: function(monster, side) {
			var el = monster.el();
			el.css('left', '100%');
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
		
		setNight: function(night) {
			if(night) {
				$('body').addClass('night');
			} else {
				$('body').removeClass('night');
			}
		},
		
		phaseTransition: function(celestial, callback) {
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
				if(callback != null) {
					callback();
				}
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
			var top = row * this.TILE_HEIGHT + this.BOARD_PAD;
			entity._leftPos = this.TILE_WIDTH * column + this.BOARD_PAD;
			el.css({
				transform: 'translate3d(0, ' + top + 'px, 0)',
				left: entity._leftPos,
			});
		},
		
		dropTiles: function(tiles, callback) {
			
			// Force a redraw so our CSS animations don't skip
			$('.tileContainer').css('left');
			
			if(callback) {
				setTimeout(callback, 200);
			}
			
			for(var t in tiles) {
				var tile = tiles[t];
				var el = tile.el();
				
				var finalTop = (tile.options.row + 1) * this.TILE_HEIGHT + this.BOARD_PAD;
				var tString = 'translate3d('+ ((tile.options.column * this.TILE_WIDTH) + this.BOARD_PAD - tile._leftPos) + 'px,' + finalTop + 'px,0);';
				
				el[0].setAttribute('style', 'left:' + tile._leftPos + 'px;transform:' + tString + '-webkit-transform:' + tString + 
						'-moz-transform:' + tString + '-ms-transform:' + tString + '-o-transform:' + tString);
			}
		},
		
		switchTiles: function(tile1, tile2, callback) {
			var el1 = tile1.el(), el2 = tile2.el();
			
			el1.css('transform', 'translate3d(' + ((tile2.options.column * this.TILE_WIDTH + this.BOARD_PAD) - tile1._leftPos) + 'px,' 
					+ ((tile2.options.row + 1) * this.TILE_WIDTH + this.BOARD_PAD) + 'px,0)');
			el2.css('transform', 'translate3d(' + ((tile1.options.column * this.TILE_WIDTH + this.BOARD_PAD) - tile2._leftPos) + 'px,'
					+ ((tile1.options.row + 1) * this.TILE_WIDTH + this.BOARD_PAD) + 'px,0)');
			
			if(callback) {
				setTimeout(function() {
					callback(tile1, tile2);
				}, 200);
			}
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
					tile.el().addClass('hidden');
				}
			}
			setTimeout(function() {
				for(var t in tiles) {
					var tile = tiles[t];
					if(tile != null) {
						tile.el().remove();
					}
				}
				callback(tiles);
			}, 300);
		},
		
		animateMove: function(entity, pos, callback, stopShort) {
			var el = entity.el();
			var dist = Math.abs(entity.p() - pos);
			el.stop().animate({
				'left': pos - (entity.width() / 2)
			}, {
				duration: dist * entity.options.speed, 
				easing: 'linear', 
				step: function(now, tween) {
					entity.p(now + entity.width() / 2);
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
					if(building.options.type.tileMod) {
						var tiles = $('.tile.' + building.options.type.tileMod);
						tiles.addClass('hidden');
						setTimeout(function() {
							$('.gameBoard')
								.removeClass(building.options.type.tileMod + (building.options.type.tileLevel - 1))
								.addClass(building.options.type.tileMod + building.options.type.tileLevel);
							tiles.removeClass('hidden');
						}, 300);
					}
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
				healthContainer =  $('<div>').addClass('statusContainer')
					.append($('<div>').addClass('hearts')).appendTo('.gameBoard');
			}
			return healthContainer;
		},
		
		updateExperience: function(xp, toLevel) {
			var xpBar = $('.xpBar');
			if(xpBar.length == 0) {
				xpBar = $('<div>').addClass('xpBar').addClass('litBorder')
					.addClass('hidden').append($('<div>').addClass('nightSprite'))
					.append($('<div>').addClass('fill').addClass('hidden')).appendTo('.gameBoard');
			}
			xpBar.find('.fill').css('height', (xp / toLevel * 100) + "%");
			setTimeout(function() {
				$('.xpBar, .fill').removeClass('hidden');
			}, 100);
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
		},
		
		fadeOut: function(callback) {
			$('.gameBoard').addClass('hidden');
			if(callback) {
				setTimeout(callback, 1000);
			}
		},
		
		notifySave: function() {
			$('.saveSpinner').addClass('active');
			setTimeout(function(){
				$('.saveSpinner').removeClass('active');
			}, 1500);
		},
		
		fireArrow: function(arrowClass, speed, start, end, callback) {
			var dist = end - start;
			var ARROW_TIME = 700;
			var arrow = $('<div>').addClass(arrowClass).addClass(dist > 0 ? 'right' : 'left');
			arrow.attr('style', 'left:' + start + 'px;');
			$('.world').append(arrow);
			
			arrow.css('left'); // Force a redraw before animation
			
			// Move arrow to top of arc
			arrow.attr('style', 'left:' + (start + dist/2) + 'px;');
			arrow.addClass('top');
			
			// Move arrow to end of arc
			setTimeout(function() {
				arrow.attr('style', 'left:' + (start + dist) + 'px;');
				arrow.removeClass('top').addClass('bottom');
				setTimeout(function() {
					// Remove arrow
					arrow.remove();
					if(callback) {
						callback(arrow);
					}
				}, ARROW_TIME / 2);
			}, ARROW_TIME / 2);
			
			return arrow;
		},
		
		levelUp: function(dude) {
			var p = dude.p();
			var effect = $('<div>').addClass('levelEffect').css('left', (p - 1) + 'px').appendTo('.world');
			effect.css('left'); // force redraw before animation
			effect.css('height', '100%');
			setTimeout(function() {
				effect.css({
					'width': '200px',
					'left': (p - 100) + 'px',
					'opacity': 0
				});
			}, 300);
		},
		
		updateHealthBar: function(entity) {
			var bar = entity.el().find('.healthBar div');
			if(bar.length > 0) {
				var healthPercent = Math.floor(entity.hp() / entity.maxHealth() * 100);
				bar.css('width', healthPercent + '%');
			}
		},
		
		handleDayBreak: function(dayNumber) {
			require(['app/graphics'], function(Graphics) {
				var txt = Graphics.textStore.get('DAY');
				var notifier = $('<div>').addClass('dayNotifier').text(txt + " " + dayNumber).appendTo('.world');
				setTimeout(function() {
					notifier.addClass('hidden');
				}, 3000);
				setTimeout(function() {
					notifier.remove();
				}, 3500);
			});
		}
	};
});