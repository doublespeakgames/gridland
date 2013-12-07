define(['jquery', 'app/eventmanager', 'app/analytics', 'app/graphics/graphics', 'app/entity/building', 
		'app/gamecontent', 'app/gamestate', 'app/action/actionfactory', 'app/entity/monster/monsterfactory',
        'app/entity/block', 'app/entity/gem', 'app/resources', 'app/entity/celestial', 'app/entity/dude'], 
		function($, EventManager, Analytics, Graphics, Building, Content, GameState, 
				ActionFactory, MonsterFactory, Block, Gem, Resources, Celestial, Dude) {
	
	var hasteTick = false;
	var dude = null;
	var celestial = null;
	var gem = null;
	var effects = {};
	var isNight = false;
	var celestialPosition = 0;
	var stuff = [];
	var inTransition = false;
	var _el = null;
	var gameLoop = null;
	
	var World = {		
		options: {
			dayMoves: 20,
			nightMoves: 15
		},
		init: function(opts) {
			$.extend(this.options, opts);
			_el = null;
			dude = null;
			celestial = null;
			gem = null;
			stuff.length = 0;
			effects = {};
			isNight = false;
			celestialPosition = 0;
			
			EventManager.bind('launchDude', launchDude);
			EventManager.bind('wipeMonsters', wipeMonsters);
			EventManager.bind('healDude', healDude);
			EventManager.bind('newEntity', handleNewEntity);
			EventManager.bind('buildingComplete', handleNewEntity);
			EventManager.bind('tilesCleared', handleTileClear);
			EventManager.bind('noMoreMoves', handleNoMoreMoves);
			EventManager.bind('tilesSwapped', handleTilesSwapped);
			EventManager.bind('updateGem', updateGem);
			EventManager.bind('phaseChange', phaseTransition);
			EventManager.bind('newStateEffect', addStateEffect);
			EventManager.bind('levelUp', wipeMonsters);
			EventManager.bind('resourceStoreChanged', handleResourceStoreChanged);
			EventManager.bind('fillEquipment', function() {
				addDefense(GameState.maxShield());
				addAttack(GameState.maxSword());
			});
			
			updateGem();
			
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
				} else if(!building.obsolete && canBuild(building.options.type)) {
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
			
			if(gameLoop != null) {
				clearInterval(gameLoop);
			}
			gameLoop = setInterval(makeStuffHappen, 100);
			inTransition = false;
		},
		
		el: function() {
			if(_el == null) {
				_el = Graphics.make('world');
			}
			return _el;
		},
		
		/**
		 * Returns a function (with the dude as the only parameter) to give the dude something to do.
		 * Checks for buildable buildings, moveable resources, etc...
		 */
		getActivity: function() {
			if(GameState.health <= 0) {
				return ActionFactory.getAction("Die");
			}
			if(isNight) {
				// Look for a monster to fight
				var closest = World.findClosestMonster();
				if(closest != null && dude.attackRange(closest)) {
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
				closest = World.findClosestLoot();
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
					if(building == null && canBuild(buildingType)) {
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
			stuff.splice(stuff.indexOf(building));
			building.el().remove();
		},
		
		hasEffect: function(effectName) {
			return effects[effectName] != null;
		},
		
		getDude: function() {
			return dude;
		},
		
		findClosestMonster: function() {
			return findClosest(function(thing) {
				return thing.hostile && thing.isAlive();
			});
		},
		
		findClosestLoot: function() {
			return findClosest(function(thing) {
				return thing.lootable && !thing.gone;
			});
		}
	};
	
	function findClosest(filter) {
		var closest = null;
		for(var i in stuff) {
			var thing = stuff[i];
			if((filter == null || filter(thing) == true) && (closest == null || 
					dude.distanceFrom(thing) < dude.distanceFrom(closest))) {
				closest = thing;
			}
		}
		return closest;
	}
	
	function canBuild(buildingType) {
		if(buildingType.requiredLevel != null && 
				GameState.level < buildingType.requiredLevel) {
			return false;
		}
		if(buildingType.test && !buildingType.test(GameState)) {
			return false;
		}
		if(buildingType.replaces != null) {
			var replaceType = Content.getBuildingType(buildingType.replaces);
			if(!GameState.hasBuilding(replaceType)) {
				return false;
			}
		}
		return true;
	}
	
	function addDefense(num) {
		dude.shield += num;
		if(dude.shield > GameState.maxShield()) {
			dude.shield = GameState.maxShield();
		}
		Graphics.updateShield(dude.shield, GameState.maxShield());
	}
	
	function addAttack(num) {
		dude.sword += num;
		if(dude.sword > GameState.maxSword()) {
			dude.sword = GameState.maxSword();
		}
		Graphics.updateSword(dude.sword, GameState.maxSword());
	}
	
	function addMana(num) {
		GameState.mana = GameState.mana ? GameState.mana + num : num;
		if(GameState.mana > GameState.maxMana()) {
			GameState.mana = GameState.maxMana();
		}
		EventManager.trigger("updateMana", [GameState.mana, GameState.maxMana()]);
	}
	
	function spawnMonster(monsterType, tiles, side) {
		var monster = MonsterFactory.getMonster(monsterType, {tiles: tiles});
		Graphics.addMonster(monster, side);
		stuff.push(monster);
	}
	
	function updateGem() {
		if(GameState.gem > 0) {
			if(gem == null) {
				gem = new Gem();
				gem.p(Content.BuildingType.Tower.position);
				EventManager.trigger('newEntity', [gem]);
			}
			gem.animation(GameState.gem - 1);
		}
	}
	
	function stopAllActions() {
		for(var i in stuff) {
			var entity = stuff[i];
			if(entity.action != null) {
				entity.action.terminateAction(entity);
			}
		}
	}
	
	function addStateEffect(effect) {
		stopAllActions();
		var existingEffect = effects[effect.className];
		if(existingEffect != null) {
			clearTimeout(existingEffect);
		}
		effects[effect.className] = setTimeout(function() {
			effects[effect.className] = null;
			stopAllActions();
		}, effect.duration);
	}
	
	function handleNewEntity(entity) {
		stuff.push(entity);
	}
	
	function handleTilesSwapped() {
		if(!isNight) {
			advanceTime();
			makeDudeHungry();
		}
	}
	
	function handleNoMoreMoves() {
		if(isNight) {
			// Take damage
			dude.takeDamage(Math.floor(dude.hp() / 2));
		} else {
			// Burn daylight
			advanceTime(5);
		}
	}
	
	function handleTileClear(resourcesGained, side) {
		// Gain resources
		for(typeName in resourcesGained) {
			var type = Content.getResourceType(typeName);
			if(isNight && !inTransition) {
				var effect = null;
				for(var b in type.nightEffect) {
					if(b == "default" || GameState.hasBuilding(Content.getBuildingType(b))) {
						effect = type.nightEffect[b];
						break;
					}
				}
				if(effect != null) {
					var nightEffect = effect.split(':');
					switch(nightEffect[0]) {
					case "spawn":
						spawnMonster(nightEffect[1], resourcesGained[typeName], side);
						break;
					case "shield":
						addDefense(parseInt(nightEffect[1]) * resourcesGained[typeName]);
						break;
					case "sword":
						addAttack(parseInt(nightEffect[1]) * resourcesGained[typeName]);
						break;
					}
				}
			} else {
				// Apply building multipliers
				var quantity = resourcesGained[typeName];
				if(type.multipliers) {
					for(var b in type.multipliers) {
						var bType = Content.getBuildingType(b);
						if(GameState.hasBuilding(bType, true)) {
							quantity *= type.multipliers[b];
						}
					}
				}
				if(type == Content.ResourceType.Grain) {
					EventManager.trigger("healDude", [quantity]);
				} else if(type ==  Content.ResourceType.Mana) {
					addMana(quantity);
				} else {
					Resources.collectResource(Content.getResourceType(typeName), quantity);
				}
			}
		}
	}
	
	function makeStuffHappen() {
		if(hasteTick && World.hasEffect('haste')) {
			runEntity(dude);
		} else if(!hasteTick) {
			for(var i = 0; i < stuff.length; i++) {
				var entity = stuff[i];
				
				var frozen = effects['freezeTime'] != null && entity != dude;
				
				if((entity.hostile || entity.lootable) && !isNight) {
					// Monsters and chests cannot survive the daylight
					if(entity.action != null) {
						entity.action.terminateAction(entity);
					}
					entity.el().remove();
					entity.gone = true;
				} 
				if(!entity.gone) {
					if(!entity.paused && !frozen) {
						runEntity(entity);
					}
				} else if(entity.hostile) {
					if(isNight && !entity.wiped) {
						dude.gainXp(entity.xp);
						advanceTime();
					}
					EventManager.trigger('monsterKilled', [entity]);
					stuff.splice(i, 1);
					i--;
				} else if(entity == dude) {
					// Dude is dead. Long live the dude.
					stuff.splice(i, 1);
					i--;
					inTransition = true;
					GameState.saveXp();
					Graphics.fadeOut(function() {
						setTimeout(function() {
							Graphics.setNight(false);
						}, 500);
						setTimeout(function() {
							Engine.init();
						}, 1000);
					});
				}
			}
		}
		
		hasteTick = !hasteTick;
	}
	
	function runEntity(entity) {
		// Only animate if a new action wasn't created
		entity.think() || entity.animate();
		if(entity.action != null) {
			entity.action.doFrameAction(entity.frame);
		}
	}
	
	function launchDude() {
		dude = new Dude();
		stuff.push(dude);
		dude.makeIdle();
		dude.action = ActionFactory.getAction("Climb");
		dude.action.doAction(dude);
		Graphics.addToWorld(dude);
		dude.p(Graphics.worldWidth() / 2);
		Graphics.setPosition(dude, dude.p());
	}
	
	function launchCelestial() {
		celestial = new Celestial();
		stuff.push(celestial);
		celestial.animation(0);
		Graphics.addToWorld(celestial);
		Graphics.raiseCelestial(celestial);
		EventManager.trigger('dayBreak', [GameState.dayNumber]);
	}
	
	function advanceTime(steps) {
		if(effects['freezeTime'] != null) {
			// Time does not advance when frozen
			return;
		}
		steps = steps == null ? 1 : steps;
		if(celestial != null) {
			var numSteps = isNight ? World.options.nightMoves : World.options.dayMoves;
			celestialPosition += steps;
			if(celestialPosition >= numSteps) {
				phaseTransition();
			} else {
				var worldWidth = Graphics.worldWidth();
				celestial.p(Math.floor(worldWidth / numSteps) * celestialPosition);
				Graphics.moveCelestial(celestial, celestial.p());
			}
		}
	}
	
	function phaseTransition() {
		inTransition = true;
		Graphics.phaseTransition(celestial, function() {
			inTransition = false;
		});
		isNight = !isNight;
		if(dude.action != null) {
			dude.action.terminateAction(dude);						
		}
		celestialPosition = 0;
		dude.shield = 0;
		dude.sword = 0;
		Graphics.updateShield(0, 0);
		Graphics.updateSword(0, 0);
		
		if(!isNight) {
			GameState.dayNumber++;
			GameState.save();
			Graphics.notifySave();
			Analytics.trackEvent('world', 'morning');
			EventManager.trigger('dayBreak', [GameState.dayNumber]);
		} else {
			Analytics.trackEvent('world', 'nightfall');
		}
	}
	
	function wipeMonsters() {
		for(var i in stuff) {
			var entity = stuff[i];
			if(entity.hostile) {
				entity.wiped = true;
				entity.die();
				EventManager.trigger('monsterKilled', [entity]);
			}
		}
	}
	
	function makeDudeHungry() {
		if(dude != null) {
			dude.takeDamage(1);
		}
	}
	
	function healDude(amount) {
		if(dude != null) {
			dude.heal(amount);
		}
	}
	
	function handleResourceStoreChanged(rows, cols) {
		if(!Resources.loaded) {
			Resources.init();
			launchCelestial();
		}
		Resources.setSize(rows, cols);
	}
	
	return World;
});
