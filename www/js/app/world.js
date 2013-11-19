define(['jquery', 'app/eventmanager', 'app/analytics', 'app/graphics/graphics', 'app/entity/building', 
		'app/gamecontent', 'app/gamestate', 'app/action/actionfactory', 'app/entity/monster/monsterfactory',
        'app/entity/block'], 
		function($, EventManager, Analytics, Graphics, Building, Content, GameState, ActionFactory, MonsterFactory, Block) {
	return {
		stuff: [],
		
		options: {
			dayMoves: 20,
			nightMoves: 15
		},
		init: function(opts) {
			$.extend(this.options, opts);
			this._el = null;
			this.dude = null;
			this.celestial = null;
			this.stuff.length = 0;
			Graphics.addToBoard(this);
			this.isNight = false;
			this.celestialPosition = 0;
			
			EventManager.bind('wipeMonsters', this.wipeMonsters);
			EventManager.bind('healDude', this.healDude);
			EventManager.bind('newEntity', this.handleNewEntity);
			EventManager.bind('tilesCleared', this.handleTileClear);
			EventManager.bind('noMoreMoves', this.handleNoMoreMoves);
			EventManager.bind('tilesSwapped', this.handleTilesSwapped);
			EventManager.bind('levelUp', function() {
				var w = require('app/world');
				w.wipeMonsters();
			});
			EventManager.bind('fillEquipment', function() {
				var w = require('app/world'), s = require('app/gamestate');
				w.addDefense(s.maxShield());
				w.addAttack(s.maxSword());
			});
			
			for(var i in GameState.buildings) {
				var building = GameState.buildings[i];
				if(building.built && !building.obsolete) {
					Graphics.addToWorld(building);
					Graphics.setPosition(building, building.p());
					if(building.options.type.tileMod) {
						$('.gameBoard').addClass(building.options.type.tileMod + building.options.type.tileLevel);
					}
					building.el().css('bottom', '0px');
					building.el().find('.blockPile').css('top', '100%');
					var cb = Content.BuildingCallbacks[building.options.type.className];
					if(cb) {
						cb();
					}
				} else if(!building.obsolete && this.canBuild(building.options.type)) {
					Graphics.addToWorld(building);
					Graphics.setPosition(building, building.p());
					for(var r in building.options.type.cost) {
						var cost = building.options.type.cost[r];
						var required = building.requiredResources[r];
						for(var n = 0, has = cost - required; n < has; n++) {
							var block = new Block({
								type: Content.getResourceType(r)
							});
							Graphics.dropBlock(block, building);
							block.quantity(block.max);
						}
					}
				}
			}
			
			if(this.gameLoop != null) {
				clearInterval(this.gameLoop);
			}
			this.gameLoop = setInterval(this.makeStuffHappen, 200);
		},
		
		el: function() {
			if(this._el == null) {
				this._el = Graphics.make('world');
			}
			return this._el;
		},
		
		handleNewEntity: function(entity) {
			require(['app/world'], function(World) {
				World.stuff.push(entity);
			});
		},
		
		handleTilesSwapped: function() {
			require(['app/world'], function(World) {
				if(!World.isNight) {
					World.advanceTime();
					World.makeDudeHungry();
				}
			});
		},
		
		handleNoMoreMoves: function() {
			require(['app/world'], function(World) {
				if(World.isNight) {
					// Take damage
					World.dude.takeDamage(Math.floor(World.dude.hp() / 2));
				} else {
					// Burn daylight
					World.advanceTime(5);
				}
			});
		},
		
		handleTileClear: function(resourcesGained, side) {
			require(['app/gamecontent', 'app/world', 'app/gamestate', 'app/resources'], function(Content, World, State, Resources) {
				// Gain resources
				for(typeName in resourcesGained) {
					var type = Content.getResourceType(typeName);
					if(World.isNight && !World.inTransition) {
						var effect = null;
						for(var b in type.nightEffect) {
							if(b == "default" || State.hasBuilding(Content.getBuildingType(b))) {
								effect = type.nightEffect[b];
								break;
							}
						}
						if(effect != null) {
							var nightEffect = effect.split(':');
							switch(nightEffect[0]) {
							case "spawn":
								World.spawnMonster(nightEffect[1], resourcesGained[typeName], side);
								break;
							case "shield":
								World.addDefense(parseInt(nightEffect[1]) * resourcesGained[typeName]);
								break;
							case "sword":
								World.addAttack(parseInt(nightEffect[1]) * resourcesGained[typeName]);
								break;
							}
						}
					} else {
						// Apply building multipliers
						var quantity = resourcesGained[typeName];
						if(type.multipliers) {
							for(var b in type.multipliers) {
								var bType = Content.getBuildingType(b);
								if(State.hasBuilding(bType, true)) {
									quantity *= type.multipliers[b];
								}
							}
						}
						if(type == Content.ResourceType.Grain) {
							EventManager.trigger("healDude", [quantity]);
						} else {
							Resources.collectResource(Content.getResourceType(typeName), quantity);
						}
					}
				}
			});
		},
		
		makeStuffHappen: function() {
			require(['app/world'], function(World) {
				var newStuff = [];
				for(var i = 0, len = World.stuff.length; i < len; i++) {
					var entity = World.stuff[i];
					if((entity.hostile || entity.lootable) && !World.isNight) {
						// Monsters and chests cannot survive the daylight
						if(entity.action != null) {
							entity.action.terminateAction(entity);
						}
						entity.el().remove();
						entity.gone = true;
					} 
					if(entity.action != null && !entity.gone) {
						entity.action.doFrameAction(entity.frame);
					}
					if(!entity.gone) {
						if(!entity.paused) {
							entity.animate();
							entity.think();
						}
						newStuff.push(entity);
					} else if(entity.hostile && World.isNight && !entity.wiped) {
						EventManager.trigger('monsterKilled', [entity]);
						World.dude.gainXp(entity.xp);
						World.advanceTime();
					} else if(entity == World.dude) {
						// Dude is dead. Long live the dude.
						GameState.saveXp();
						Graphics.fadeOut(function() {
							setTimeout(function() {
								require(['app/graphics/graphics'], function(G) {
									Graphics.setNight(false);
								}, 500);
							});
							setTimeout(function() {
								require(['app/engine'], function(Engine) {
									Engine.init();
								});
							}, 1000);
						});
					}
				}
				World.stuff.length = 0;
				World.stuff = newStuff;
			});
		},
		
		launchDude: function() {
			require(['app/world', 'app/graphics/graphics', 'app/entity/dude', 'app/gamestate'], 
					function(World, Graphics, Dude, GameState) {
				var dude = World.dude = new Dude();
				World.stuff.push(dude);
				dude.animation(0);
				dude.animationOnce(7);
				Graphics.addToWorld(dude);
				dude.p(World.el().width() / 2);
				Graphics.setPosition(dude, dude.p());
			});
		},
		
		launchCelestial: function() {
			require(['app/world', 'app/graphics/graphics', 'app/entity/celestial', 'app/eventmanager', 'app/gamestate'], 
					function(World, Graphics, Celestial, EventManager, GameState) {
				var celestial = World.celestial = new Celestial();
				World.stuff.push(celestial);
				celestial.animation(0);
				Graphics.addToWorld(celestial);
				Graphics.raiseCelestial(celestial);
				EventManager.trigger('dayBreak', [GameState.dayNumber]);
			});
		},
		
		advanceTime: function(steps) {
			steps = steps == null ? 1 : steps;
			if(this.celestial != null) {
				var numSteps = this.isNight ? this.options.nightMoves : this.options.dayMoves;
				this.celestialPosition += steps;
				if(this.celestialPosition >= numSteps) {
					this.phaseTransition();
				} else {
					var worldWidth = Graphics.worldWidth();
					this.celestial.p(Math.floor(worldWidth / numSteps) * this.celestialPosition);
					Graphics.moveCelestial(this.celestial, this.celestial.p());
				}
			}
		},
		
		phaseTransition: function() {
			this.inTransition = true;
			var _w = this;
			Graphics.phaseTransition(this.celestial, function() {
				_w.inTransition = false;
			});
			this.isNight = !this.isNight;
			if(this.dude.action != null) {
				this.dude.action.terminateAction(this.dude);						
			}
			this.celestialPosition = 0;
			this.dude.shield = 0;
			this.dude.sword = 0;
			Graphics.updateShield(0, 0);
			Graphics.updateSword(0, 0);
			
			if(!this.isNight) {
				GameState.dayNumber++;
				GameState.save();
				Graphics.notifySave();
				Analytics.trackEvent('world', 'morning');
				EventManager.trigger('dayBreak', [GameState.dayNumber]);
			} else {
				Analytics.trackEvent('world', 'nightfall');
			}
		},
		
		wipeMonsters: function() {
			var w = require('app/world'), e = require('app/eventmanager');
			for(var i in w.stuff) {
				var entity = w.stuff[i];
				if(entity.hostile) {
					entity.wiped = true;
					entity.die();
					e.trigger('monsterKilled', [entity]);
				}
			}
		},
		
		makeDudeHungry: function() {
			if(this.dude != null) {
				this.dude.takeDamage(1);
			}
		},
		
		healDude: function(amount) {
			var w = require('app/world');
			if(w.dude != null) {
				w.dude.heal(amount);
			}
		},
		
		findClosestMonster: function() {
			return this.findClosest(function(thing) {
				return thing.hostile && thing.isAlive();
			});
		},
		
		findClosestLoot: function() {
			return this.findClosest(function(thing) {
				return thing.lootable && !thing.gone;
			});
		},
		
		findClosest: function(filter) {
			var closest = null;
			for(var i in this.stuff) {
				var thing = this.stuff[i];
				if((filter == null || filter(thing) == true) && (closest == null || 
						this.dude.distanceFrom(thing) < this.dude.distanceFrom(closest))) {
					closest = thing;
				}
			}
			return closest;
		},
		
		/**
		 * Returns a function (with the dude as the only parameter) to give the dude something to do.
		 * Checks for buildable buildings, moveable resources, etc...
		 */
		getActivity: function() {
			if(this.isNight) {
				// Look for a monster to fight
				var closest = this.findClosestMonster();
				if(closest != null && this.dude.attackRange(closest)) {
					return ActionFactory.getAction("Attack", {
						target: closest
					});
				} else if(closest != null) {
					// Move closer
					return ActionFactory.getAction("MoveTo", {
						target: closest
					});
				}
				// No monsters? Pick up loot!
				closest = this.findClosestLoot();
				if(closest != null) {
					return ActionFactory.getAction("GetLoot", {
						target: closest
					});
				}
			} else {
				// Look for buildable buildings first
				var totalNeeded = null;
				var moveAction = null;
				var priority = null;
				for(var t in Content.BuildingType) {
					var buildingType = Content.BuildingType[t];
					var building = GameState.getBuilding(buildingType);
					// Add it to the buildings list, if it should be available to build and it isn't.
					if(building == null && this.canBuild(buildingType)) {
						building = new Building({
							type: buildingType
						});
						GameState.buildings.push(building);
						Graphics.addToWorld(building);
						Graphics.setPosition(building, building.p());
					}
					
					// If it's ready to build, build it.
					if(building != null && building.readyToBuild()) {
						return ActionFactory.getAction("RaiseBuilding", {
							building: building
						});
					}
				
					// Then look for moveable resources
					else if(building != null && !building.built) {
						for(var b in GameState.stores) {
							var block = GameState.stores[b];
							if(!block.gone && block.spaceLeft() == 0) {
								for(var resource in building.requiredResources) {
									var required = building.requiredResources[resource];
									var cost = buildingType.cost[resource];
									var highPriority = priority == null || buildingType.priority < priority || 
											(buildingType.priority == priority && 
													(totalNeeded == null || cost < totalNeeded));
									if(required > 0 && resource == block.options.type.className && highPriority) {
										// We can move this block!
										moveAction = ActionFactory.getAction("MoveBlock", {
											block: block,
											destination: building
										});
										priority = buildingType.priority;
										totalNeeded = cost;
									}
								}
							}
						}
					}
				}
				// If no urgent actions are returned, move the block that is the most required.
				return moveAction;
			}
			
			// Then give up, and return null
			return null;
		},
		
		removeBuilding: function(type) {
			var building = GameState.getBuilding(type);
			building.obsolete = true;
			this.stuff.splice(this.stuff.indexOf(building));
			building.el().remove();
		},
		
		canBuild: function(buildingType) {
			if(buildingType.requiredLevel != null && 
					GameState.level < buildingType.requiredLevel) {
				return false;
			}
			if(buildingType.replaces != null) {
				var replaceType = Content.getBuildingType(buildingType.replaces);
				if(!GameState.hasBuilding(replaceType)) {
					return false;
				}
			}
			return true;
		},
		
		addDefense: function(num) {
			this.dude.shield += num;
			if(this.dude.shield > GameState.maxShield()) {
				this.dude.shield = GameState.maxShield();
			}
			Graphics.updateShield(this.dude.shield, GameState.maxShield());
		},
		
		addAttack: function(num) {
			this.dude.sword += num;
			if(this.dude.sword > GameState.maxSword()) {
				this.dude.sword = GameState.maxSword();
			}
			Graphics.updateSword(this.dude.sword, GameState.maxSword());
		},
		
		spawnMonster: function(monsterType, tiles, side) {
			var monster = MonsterFactory.getMonster(monsterType, {tiles: tiles});
			Graphics.addMonster(monster, side);
			this.stuff.push(monster);
		}
	};
});
