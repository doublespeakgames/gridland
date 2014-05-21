define(['jquery', 'app/eventmanager', 'app/textStore', 'app/gameoptions',
        'app/graphics/gameboard', 'app/graphics/world', 'app/graphics/resources', 
        'app/graphics/loot', 'app/graphics/magic', 'app/graphics/audio'], 
		function($, EventManager, TextStore, Options, BoardGraphics, WorldGraphics, ResourceGraphics,
				LootGraphics, MagicGraphics, AudioGraphics) {
	
	var textStore;
	var costsOn = false;
	var _ww = null, _wh = null;
	var _bossHealth = null;
	var _numHearts = 0;
	
	function handleDrawRequest(requestString, options) {
		var moduleString = requestString.substring(0, requestString.indexOf('.'));
		requestString = requestString.substring(requestString.indexOf('.') + 1);
		
		var module = null;
		switch(moduleString.toLowerCase()) {
			case 'board':
				module = BoardGraphics;
				break;
			case 'world':
				module = WorldGraphics;
				break;
			case 'resource':
				module = ResourceGraphics;
				break;
			case 'loot':
				module = LootGraphics;
				break;
			case 'magic':
				module = MagicGraphics;
				break;
			case 'audio':
				module = AudioGraphics;
				break;
		}
		
		var time = 0;
		if(module != null && module.handleDrawRequest) {
			time = module.handleDrawRequest(requestString, options);
		}
		
		setTimeout(function() {
			EventManager.trigger('graphicsActionComplete');
		}, time);
	}
	
	function changeTiles(tileTypes, classToAdd, classToRemove) {
		var tileClasses = '';
		tileTypes.forEach(function(type) {
			tileClasses += (tileClasses.length > 0 ? ', ' : '') + '.tile.' + type;
		});
		var tiles = $(tileClasses);
		tiles.addClass('hidden');
		setTimeout(function() {
			BoardGraphics.el().removeClass(classToRemove).addClass(classToAdd);
			tiles.removeClass('hidden');
		}, 300);
	}
	
	var getStats = (function() {
		var _stats = null;
		return function(counts) {
			var list;
			if(_stats == null) {
				_stats = Graphics.make().attr('id', 'endGame');
				_stats.append($('<h2>').text(textStore.get('CLEAR')));
				_stats.append($('<ul>').addClass('menu')
					.append($('<li>').text(textStore.get('CONTINUE')).click(continueGame))
					.append($('<li>').text(textStore.get('NEWGAMEPLUS')).click(newGamePlus)));
				list = $('<ul>').addClass('counts').appendTo(_stats);
				Graphics.get('body').append(_stats);
				_stats.css('left');
			} else {
				list = $('ul.list', _stats);
				if(counts) {
					list.empty();
				}
			}
			
			if(counts) {
				for(var key in counts) {
					list.append($('<li>')
						.append($('<span>').text(textStore.get(key) || 0))
						.append($('<span>').text(counts[key]))
					);
				}
			}
			
			return _stats;
		};
	})();
	
	function gameOver(counts) {
		Graphics.get('body').addClass('bigExplosion');
		setTimeout(function() {
			getStats(counts).addClass('down');
		}, 2000);
	}
	
	function continueGame() {
		EventManager.trigger('phaseChange');
		getStats().removeClass('down');
		BoardGraphics.el().removeClass('dragonFight');
		var b = Graphics.get('body');
		setTimeout(function() {
			b.addClass('fadeOut');
		}, 1400);
		setTimeout(function() {
			b.removeClass('bigExplosion fadeOut');
		}, 2800);
	}
	
	function newGamePlus() {
		getStats().removeClass('down');
		BoardGraphics.el().removeClass('dragonFight');
		var b = Graphics.get('body');
		b.removeClass('night');
		setTimeout(function() {
			b.addClass('fadeOut');
			EventManager.trigger('prestige');
		}, 1400);
		setTimeout(function() {
			b.removeClass('bigExplosion fadeOut');
		}, 2800);
	}
	
	function dropBlock(block, building) {
		block.el().remove();
		Graphics.updateCosts(building);
	}
	
	var Graphics = {
		init: function() {
			$('body').removeClass('night');
			
			textStore = new TextStore();
			
			EventManager.bind('draw', handleDrawRequest);
			
			EventManager.bind('monsterKilled', this.monsterKilled);
			EventManager.bind('newEntity', this.addToWorld);
			EventManager.bind('removeEntity', this.removeFromWorld);
			EventManager.bind('healthChanged', this.updateHealthBar);
			EventManager.bind('dayBreak', this.handleDayBreak);
			EventManager.bind('gameOver', gameOver);
			EventManager.bind('blockDown', dropBlock);
			
			BoardGraphics.init();
			WorldGraphics.init();
			ResourceGraphics.init();
			LootGraphics.init();
			MagicGraphics.init();
			if(!require('app/engine').isSilent()) {
				AudioGraphics.init();
			}
		},
		
		isReady: function() {
			return textStore && textStore.isReady();
		},
		
		getText: function(key) {
			return textStore.get(key);
		},
		
		attachHandler: function(moduleName, event, element, handler) {
			var module = require('app/graphics/' + moduleName.toLowerCase());
			module.attachHandler(event, element, handler);
		},
		
		get: function(selector, context, returnEmpty) {
			var ret = context ? context.find(selector) : $(selector);
			if(returnEmpty || ret.length > 0) {
				return ret;
			}
			return null;
		},
		
		remove: function(thing) {
			var el = thing.el ? thing.el() : thing;
			thing.remove();
		},
		
		createResourceBar: function(resource, number) {
			var el = $('<li>').addClass('resourceBar').addClass(resource);
			$('<div>').addClass('resourceBar-inner').appendTo(el);
			return el;
		},
		
		make: function(className, tagName) {
			tagName = tagName || 'div';
			return $('<' + tagName + '>').addClass(className);
		},
		
		addToWorld: function(entity) {
			if(entity.el == null) {
				WorldGraphics.add(entity);
			} else {
				var g = require('app/graphics/graphics');
				WorldGraphics.add(entity.el());
				if(entity.p) {
					g.setPosition(entity, entity.p());
				}
				g.updateSprite(entity);
			}
		},
		
		removeFromWorld: function(entity) {
			WorldGraphics.remove(entity.el ? entity.el() : entity);
		},
		
		worldWidth: function() {
			if(_ww == null) {
				_ww = $('.world').width();
			}
			return _ww;
		},
		
		worldHeight: function() {
			if(_wh == null) {
				_wh = $('.world').height();
			}
			return _wh;
		},
		
		addToScreen: function(entity) {
			$('body').append(entity.el ? entity.el() : entity);
		},
		
		addToBoard: function(entity) {
			$('.gameBoard').append(entity.el ? entity.el() : entity);
		},
		
		addToMenu: function(entity) {
			$('.menuBar').prepend(entity.el ? entity.el() : entity);
		},
		
		hide: function(entity) {
			(entity.el ? entity.el() : entity).addClass('hidden');
		},
		
		show: function(entity) {
			(entity.el ? entity.el() : entity).removeClass('hidden');
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
		
		moveCelestial: function(entity) {
			var el = entity.el();
			var pos = entity.p();
			var height = (Math.abs(pos - Graphics.worldWidth() / 2) / (Graphics.worldWidth() / 2)) * 30;
			var left = (pos - (el.width() / 2)),
				top = Math.floor(height);
			el.css({
				'transform': 'translate3d(' + left + 'px, ' + top + 'px, 0)',
				'-webkit-transform': 'translate3d(' + left + 'px, ' + top + 'px, 0)',
				'-moz-transform': 'translate3d(' + left + 'px, ' + top + 'px, 0)',
				'-ms-transform': 'translate3d(' + left + 'px, ' + top + 'px, 0)',
				'-o-transform': 'translate3d(' + left + 'px, ' + top + 'px, 0)'
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
			var left = celestial.p() - (celestial.el().width() / 2);
			celestial.el().css({
				'transform': 'translate3d(' + left + 'px, ' + (Graphics.worldHeight() + 10) + 'px, 0)',
				'-webkit-transform': 'translate3d(' + left + 'px, ' + (Graphics.worldHeight() + 10) + 'px, 0)',
				'-moz-transform': 'translate3d(' + left + 'px, ' + (Graphics.worldHeight() + 10) + 'px, 0)',
				'-ms-transform': 'translate3d(' + left + 'px, ' + (Graphics.worldHeight() + 10) + 'px, 0)',
				'-o-transform': 'translate3d(' + left + 'px, ' + (Graphics.worldHeight() + 10) + 'px, 0)'
			});
			$('body').toggleClass('night');
			var _g = this;
			setTimeout(function() {
				if($('body').hasClass('night')) {
					celestial.animation(1);
				} else {
					celestial.animation(0);
				}
				celestial.el().css({
					'transform': 'translate3d(0px, ' + (Graphics.worldHeight() + 10) + 'px, 0)',
					'-webkit-transform': 'translate3d(0px, ' + (Graphics.worldHeight() + 10) + 'px, 0)',
					'-moz-transform': 'translate3d(0px, ' + (Graphics.worldHeight() + 10) + 'px, 0)',
					'-ms-transform': 'translate3d(0px, ' + (Graphics.worldHeight() + 10) + 'px, 0)',
					'-o-transform': 'translate3d(0px, ' + (Graphics.worldHeight() + 10) + 'px, 0)'
				});
				
				setTimeout(function() {
					_g.raiseCelestial(celestial);
					if(callback != null) {
						callback();
					}
				}, 500);
			}, 900);
		},
		
		raiseCelestial: function(celestial) {
			celestial.p(15);
			this.moveCelestial(celestial);
		},
		
		updateCosts: function(building) {
			var show = false;
			for(var r in building.requiredResources) {
				var total = building.options.type.cost[r];
				var has = total - building.requiredResources[r];
				if(has > 0) show = true;
				building.el().find('.resourceBar.' + r + ' .resourceBar-inner').css('width', (has / total * 100) + '%');
			}
			if(show) {
				building.el().find('.resourceBars').addClass('show');
				var replaces = building.getReplaces(require('app/gamestate'));
				if(replaces) {
					replaces.el().data('upgrade', building);
					Graphics.markUpgrading(replaces, true);
				}
			}
		},
		
		updateSprite: function(entity) {
			// TODO: Cache the entity width. Calling el.width() this often can't be good for performance.
			var el = entity.el();
			var spriteRow = entity.tempAnimation == null ? entity.animationRow : entity.tempAnimation;
			Graphics.updateSpritePos(el, entity.frame * el.width(), spriteRow * el.height());
			if(entity.stepFunction) {
				entity.stepFunction(entity.frame);
			}
		},
		
		updateSpritePos: function(el, x, y) {
			el.css('background-position', -(x) + "px " + -(y) + 'px');
			$('.animationLayer', el).css('background-position', -(x) + "px " + -(y) + 'px');
		},
		
		setPosition: function(entity, pos) {
			// Don't spawn chests off-screen
			if(entity.lootable && pos <= 20) {
				pos = 20;
				entity.p(pos);
			}
			if(entity.lootable && pos >= this.worldWidth() - 20) {
				pos = this.worldWidth() - 20;
				entity.p(pos);
			}
			var el = entity.el ? entity.el() : entity;
			el.css('left', (pos - (el.width() / 2)) + "px");
		},
		
		selectTile: function(tile) {
			tile.el().addClass('selected');
		},
		
		deselectTile: function(tile) {
			tile.el().removeClass('selected');
		},
		
		animateMove: function(entity, pos, callback, stopShort, speedOverride) {
			var el = entity.el();
			var speed = speedOverride || entity.speed();
			var dist = Math.abs(entity.p() - pos);
			el.stop().animate({
				'left': pos - (entity.width() / 2)
			}, {
				duration: dist * speed, 
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
		
		markUpgrading: function(building, upgrading) {
			if(upgrading) {
				building.el().addClass('upgrading');
			} else {
				building.el().removeClass('upgrading');
			}
		},
		
		raiseBuilding: function(building, callback) {
			if(building.options.type.isBase) {
				$('.resources').addClass('hidden');
			}
			var el = building.el();
			var replaces = building.getReplaces(require('app/gamestate'));
			if(replaces) {
				replaces.el().addClass('sunk');
			}
			$('.resourceBars', el).addClass('sunk');
			el.animate({
				'bottom': 0
			}, {
				duration: 5000,
				easing: 'linear',
				complete: function() {
					if(building.options.type.isBase) {
						$('.resources').removeClass('hidden');
					}
					el.find('.resourceBars').remove();
					if(building.options.type.tileMod) {
						changeTiles(
							[building.options.type.tileMod], 
							building.options.type.tileMod + building.options.type.tileLevel,
							building.options.type.tileMod + (building.options.type.tileLevel - 1)
						);
					}
					callback(building);
				}
			});
		},
		
		sinkBuilding: function(building) {
			var el = building.el();
			$('.resourceBars', el).removeClass('sunk');
			el.stop().css('bottom', '-80px');
			var replaces = building.getReplaces(require('app/gamestate'));
			if(replaces) {
				replaces.el().removeClass('sunk');
			}
		},
		
		pickUpBlock: function(block) {
			block.el().appendTo('.heldBlock');
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
		
		numHearts: function() {
			return _numHearts;
		},
		
		updateHealth: function(health, maxHealth) {
			var MAX_HEARTS = 15;
			var HEALTH_PER_HEART = 10;
			var numHearts = Math.ceil(maxHealth / HEALTH_PER_HEART);
			var numBigHearts = 0;
			if(numHearts > MAX_HEARTS) {
				numBigHearts = numHearts - MAX_HEARTS;
				numHearts = MAX_HEARTS;
			}
			_numHearts = numHearts;
			var statusContainer = $('.hearts', this.getStatusContainer());
			for(var i = 0, n = numHearts - statusContainer.children().length; i < n; i++) {
				$('<div>').addClass('heart').addClass('hidden').append($('<div>')
						.addClass('mask')).append($('<div>').addClass('mask')
						.addClass('nightSprite')).append($('<div>')
						.addClass('bar')).appendTo(statusContainer);
			}
			for(var i = numHearts; i > 0; i--) {
				var heart = $(statusContainer.children()[i - 1]);
				var heartHealth = HEALTH_PER_HEART;
				if(i <= numBigHearts) {
					heartHealth *= 2;
					heart.removeClass('heart').addClass('bigheart');
				}
				if(health >= heartHealth) {
					heart.removeClass('empty');
					$('.bar', heart).css('width', '100%');
					health -= heartHealth;
				} else if(health > 0) {
					heart.removeClass('empty');
					$('.bar', heart).css('width', (health / heartHealth * 100) + '%');
					health = 0;
				} else {
					heart.addClass('empty');
					$('.bar', heart).css('width', '0%');
				}
			}
			setTimeout(function() {
				$('.hidden', statusContainer).removeClass('hidden');
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
		
		fireArrow: function(arrowEntity, callback) {
			var start = arrowEntity.options.fireFrom,
				end = arrowEntity.options.fireTo;
			var dist = end - start;
			var ARROW_TIME = 1000;
			var arrow = arrowEntity.el();
			arrow.addClass(dist > 0 ? 'right' : 'left');
			arrow.attr('style', 
				'transform: translateX(' + start + 'px);' +
				'-webkit-transform: translateX(' + start + 'px);' +
				'-moz-transform: translateX(' + start + 'px);' +
				'-ms-transform: translateX(' + start + 'px);' +
				'-o-transform: translateX(' + start + 'px);'
			);
			$('.world').append(arrow);
			
			arrow.css('left'); // Force a redraw before animation
			
			// Move arrow to top of arc
			arrow.attr('style', 
				'transform: translateX(' + (start + dist/2) + 'px);' +
				'-webkit-transform: translateX(' + (start + dist/2) + 'px);' + 
				'-moz-transform: translateX(' + (start + dist/2) + 'px);' + 
				'-ms-transform: translateX(' + (start + dist/2) + 'px);' + 
				'-o-transform: translateX(' + (start + dist/2) + 'px);'
			);
			arrow.addClass('top');
			
			// Move arrow to end of arc
			setTimeout(function() {
				arrow.attr('style', 
					'transform: translateX(' + (start + dist) + 'px);' +
					'-webkit-transform: translateX(' + (start + dist) + 'px);' +
					'-moz-transform: translateX(' + (start + dist) + 'px);' +
					'-ms-transform: translateX(' + (start + dist) + 'px);' +
					'-o-transform: translateX(' + (start + dist) + 'px);'
				);
				arrow.removeClass('top').addClass('bottom');
				setTimeout(function() {
					// Remove arrow
					arrow.remove();
					if(callback) {
						callback(arrow);
					}
				}, ARROW_TIME / 2);
			}, ARROW_TIME / 2);
			
			return arrowEntity;
		},
		
		levelUp: function(dude) {
			var p = dude.p();
			var effect = $('<div>').addClass('levelEffect').css('left', (p - 1) + 'px').appendTo('.world');
			effect.css('left'); // force redraw before animation
			effect.css('height', '100%');
			setTimeout(function() {
				effect.css({
					'width': '100%',
					'left': '0px',
					'opacity': 0
				});
			}, 500);
			setTimeout(function() {
				effect.remove();
			}, 1000);
		},
		
		updateHealthBar: function(entity) {
			if(entity.isBoss) {
				Graphics.setBossHealth(entity.hp(), entity.getMaxHealth());
			} else {
				var bar = entity.el().find('.healthBar div');
				if(bar.length > 0) {
					var healthPercent = Math.floor(entity.hp() / entity.getMaxHealth() * 100);
					bar.css('width', healthPercent + '%');
				}
			}
		},
		
		handleDayBreak: function(dayNumber) {
			require(['app/graphics/graphics'], function(Graphics) {
				var txt = Graphics.getText('DAY');
				var notifier;
				setTimeout(function() {
					notifier = $('<div>').addClass('dayNotifier').text(txt + " " + dayNumber).appendTo('.world');
				}, 700);
				setTimeout(function() {
					$('.monster, .treasureChest').remove();
					notifier.addClass('hidden');
				}, 3000);
				setTimeout(function() {
					notifier.remove();
				}, 3500);
			});
		},
		
		monsterKilled: function(monster) {
			monster.el().find('.healthBar').addClass('hidden');
		},
		
		enablePlayButton: function() {
			$('#loadingScreen .saveSpinner').addClass('hidden');
			$('#playButton').removeClass('hidden').text(Graphics.getText('PLAY'));
		},
		
		setBossHealth: function(hp, max) {
			if(_bossHealth == null) {
				_bossHealth = Graphics.make('bossHealth noshow').append(Graphics.make());
				WorldGraphics.add(_bossHealth)
				_bossHealth.css('left');
				_bossHealth.removeClass('noshow');
			}
			
			_bossHealth.find('div').css('width', (hp / max * 100) + '%');
			
			if(hp <= 0) {
				_bossHealth.addClass('noshow');
				setTimeout(function() {
					_bossHealth.remove();
					_bossHealth = null;
				}, 1000);
			}
		},
		
		landDragon: function(dragon, cb) {
			dragon.setPosture('idle');
			dragon.el().addClass('flying');
			dragon.p(dragon.options.flip ? 50 : this.worldWidth() - 50);
			dragon.animation(1, true, function(frame) {
				if(frame == 2) {
					EventManager.trigger('flap');
				}
			});
			dragon.setNeckMount({ x: 50, y: 47 });
			this.addToWorld(dragon);
			dragon.el().css('left'); // force redraw
			dragon.el().removeClass('flying');
			var tiltClass = dragon.options.flip ? 'flipTilted' : 'tilted';
			setTimeout(function() {
				EventManager.trigger('landDragon');
				dragon.animation(0);
				dragon.animationOnce(2, function(frame) {
					dragon.setNeckMount((function() {
						switch(frame) {
							case 0:
								return { x: 50, y: 47 };
							case 1:
								return { x: 30, y: 75 };
							case 2:
								return { x: 20, y: 105 };
							case 3:
								return null;
						}
					})());
				});
				dragon.setPosture('idle', 500);
				BoardGraphics.el().addClass(tiltClass);
				changeTiles(['clay', 'cloth', 'grain'], 'dragonFight', '');
			}, 1000);
			setTimeout(function() {
				Graphics.setBossHealth(dragon.hp(), dragon.getMaxHealth());
				BoardGraphics.el().removeClass(tiltClass);
				dragon.setPosture('windup', 500);
			}, 1500);
			setTimeout(function() { EventManager.trigger('roar'); dragon.setPosture('roar', 500); }, 2000);
			setTimeout(function() { BoardGraphics.el().addClass('shaking'); }, 2500);
			setTimeout(function() { BoardGraphics.el().removeClass('shaking'); dragon.setPosture('idle', 500); }, 3500);
			if(cb) {
				setTimeout(cb, 4000);
			}
		}
	};
	
	return Graphics;
});