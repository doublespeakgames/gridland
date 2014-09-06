define(['jquery', 'app/eventmanager', 'app/analytics', 'app/graphics/graphics', 'app/entity/building', 
		'app/gamecontent', 'app/gamestate', 'app/action/actionfactory', 'app/entity/monster/monsterfactory',
        'app/entity/block', 'app/entity/gem', 'app/resources', 'app/entity/celestial', 'app/entity/dude',
        'app/entity/star', 'app/entity/worldeffect'], 
		function($, EventManager, Analytics, Graphics, Building, Content, GameState, 
				ActionFactory, MonsterFactory, Block, Gem, Resources, Celestial, Dude,
				Star, WorldEffect) {
	
	var PRESTIGE_MULTIPLIER = 0.5;
	
	var hasteTick = false;
	var dude = null;
	var celestial = null;
	var gem = null;
	var effects = {};
	var isNight = false;
	var theDragon = null;
	var celestialPosition = 0;
	var stuff = [];
	var inTransition = false;
	var gameLoop = null;
	var star = null;
	var prioritizedBuilding = null;
	var recorded = null;
	var streak = 0;
	
	var _debugMultiplier = 1;
	multiplier = function(n) {
		_debugMultiplier = n > 0 ? n : 1;
		if(World.getDude()) {
			reinitializeAllActions();
		}
	};
	
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
			star = null;
			gem = null;
			stuff.length = 0;
			effects = {};
			isNight = false;
			celestialPosition = 0;
			theDragon = null;
			var deferredCallbacks = [];
			streak = 0;
			var casualNight = false;
			
			EventManager.bind('difficultyChanged', difficultyToggle);
			EventManager.bind('launchDude', launchDude);
			EventManager.bind('wipeMonsters', wipeMonsters);
			EventManager.bind('landDragon', wipeMonsters);
			EventManager.bind('damageAll', damageAllMonsters);
			EventManager.bind('healDude', healDude);
			EventManager.bind('hurtDude', hurtDude);
			EventManager.bind('newEntity', handleNewEntity);
			EventManager.bind('removeEntity', handleRemoveEntity);
			EventManager.bind('buildingComplete', handleNewEntity);
			EventManager.bind('buildingComplete', clearPriorityIfNeeded);
			EventManager.bind('tilesCleared', handleTileClear);
			EventManager.bind('noMoreMoves', handleNoMoreMoves);
			EventManager.bind('tilesSwapped', handleTilesSwapped);
			EventManager.bind('updateGem', updateGem);
			EventManager.bind('phaseChange', phaseTransition);
			EventManager.bind('newStateEffect', addStateEffect);
			EventManager.bind('endStateEffect', endStateEffect);
			EventManager.bind('levelUp', wipeMonsters);
			EventManager.bind('resourceStoreChanged', handleResourceStoreChanged);
			EventManager.bind('prioritizeBuilding', prioritizeBuilding);
			EventManager.bind('callDragon', callDragon);
			EventManager.bind('keySequenceComplete', multiplier.bind(this, 5));
			EventManager.bind('fillEquipment', function() {
				fillDefense();
				fillAttack();
			});
			EventManager.bind('gameLoaded', function() {
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
							deferredCallbacks.push(cb);
						}
					} else if(!building.obsolete && canBuild(building.options.type)) {
						Graphics.addToWorld(building);
						Graphics.setPosition(building, building.p());
						Graphics.updateCosts(building);
					}

					if(building.options.type.className == GameState.prioritizedBuilding) {
						prioritizeBuilding(building);
					}
				}
				
				while(deferredCallbacks.length > 0) {
					(deferredCallbacks.pop())();
				}
				
				if(gameLoop != null) {
					clearInterval(gameLoop);
				}
				gameLoop = setInterval(makeStuffHappen, 100);
				inTransition = false;
			});
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
				if(closest != null && dude.p() == closest.p()) {
					return ActionFactory.getAction("GetLoot", {
						target: closest
					});
				} else if(closest != null) {
					// Move closer
					return ActionFactory.getAction("MoveTo", {
						target: closest,
						useMove: true
					});
				}
			} else {
				
				// If there's a prioritized building, set up the action in advance
				var priorityMove = null;
				if(prioritizedBuilding) {
					for(var b in GameState.stores) {
						var block = GameState.stores[b];
						var resource = block.options.type.className;
						if(!block.gone && block.spaceLeft() == 0 && prioritizedBuilding.requiredResources[resource] > 0) {
							priorityMove = ActionFactory.getAction("MoveBlock", {
								block: block,
								destination: prioritizedBuilding
							});
						}
					}
				}
				
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
					
					// Use the prioritized move, if we have one
					else if(priorityMove) {
						moveAction = priorityMove;
					}
					
					// Otherwise, look for moveable resources
					else if(building != null && !building.built) {
						for(var b in GameState.stores) {
							var block = GameState.stores[b];
							if(!block.gone && block.spaceLeft() == 0) {
								var resource = block.options.type.className;
								var required = building.requiredResources[resource];
								var highPriority = priority == null || buildingType.priority < priority || 
										(buildingType.priority == priority && 
												(totalNeeded == null || required > totalNeeded));
								if(required > 0 && highPriority) {
									// We can move this block!
									moveAction = ActionFactory.getAction("MoveBlock", {
										block: block,
										destination: building
									});
									priority = buildingType.priority;
									totalNeeded = required;
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
		
		removeBuilding: function(building) {
			building.obsolete = true;
			stuff.splice(stuff.indexOf(building), 1);
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
		},
		
		canMove: function() {
			return !inTransition && dude.isAlive();
		},
		
		isNight: function() {
			return isNight;
		},
		
		startRecording: function() {
			console.log("Beginning resource recorder");
			recorded = 0;
		},
		
		reportRecord: function() {
			console.log(recorded + " resources have been gained.");
		},
		
		removeAllEffects: function(effectClass) {
			var len = stuff.length;
			while(len--) {
				var thing = stuff[len];
				if(thing instanceof WorldEffect && thing.options.effectClass == effectClass) {
					stuff.splice(len, 1);
					thing.el().remove();
				}
			}
		},
		
		gameOver: function() {
			GameState.count('DRAGONS', 1);
			GameState.save();
			Graphics.notifySave();
			EventManager.trigger('gameOver', [GameState.counts]);
		},
		
		getDebugMultiplier: function() {
			return _debugMultiplier;
		},

		setPause: function(paused) {
			if(paused && gameLoop) {
				clearInterval(gameLoop);
				gameLoop = false;
			} else {
				gameLoop = setInterval(makeStuffHappen, 300);
			}
		}
	};
	
	function prioritizeBuilding(building) {
		if(isNight) return;
		if(prioritizedBuilding && prioritizedBuilding == building) {
			// Clear on a second click
			clearPriorityIfNeeded(building);
			EventManager.trigger('deprioritize');
		} else {
			if(!star) {
				star = new Star();
				EventManager.trigger('newEntity', [star]);
			}
			EventManager.trigger('prioritize');
			prioritizedBuilding = building;
			GameState.prioritizedBuilding = building.options.type.className;
			star.p(building.options.type.position);
			Graphics.setPosition(star, star.p());
			star.el().css('display', 'block');
		}
	}
	
	function clearPriorityIfNeeded(building) {
		if(prioritizedBuilding == building) {
			prioritizedBuilding = null;
			GameState.prioritizedBuilding = null;
			star.el().css('display', 'none');
		}
	}
	
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
		if(GameState.prestige && buildingType.prestigeDependency && 
				!GameState.hasBuilding(Content.getBuildingType(buildingType.prestigeDependency))) {
			// This building has a building dependency instead of a level dependency for New Game +
			return false;
		} else if(buildingType.requiredLevel != null && 
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
	
	function fillDefense() {
		dude.shield = GameState.maxShield();
		Graphics.updateShield(dude.shield, GameState.maxShield());
	}
	
	function fillAttack() {
		dude.sword = GameState.maxSword();
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
		var monster = MonsterFactory.getMonster(monsterType, {
			tiles: tiles,
			multiplier: (GameState.prestige * PRESTIGE_MULTIPLIER) + 1
		});
		Graphics.addMonster(monster, side);
		stuff.push(monster);
		return monster;
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
	
	function reinitializeAllActions() {
		for(var i in stuff) {
			var entity = stuff[i];
			if(!entity.uninterruptable && entity.action != null) {
				entity.action.reinitialize(entity);
			}
		}
	}
	
	function addStateEffect(effect) {
		var existingEffect = effects[effect.className];
		if(existingEffect != null) {
			clearTimeout(existingEffect);
		}
		effect.start && effect.start(dude);
		effects[effect.className] = setTimeout(function() {
			effect.end && effect.end(dude);
			effects[effect.className] = null;
			reinitializeAllActions();
		}, effect.duration);
		
		reinitializeAllActions();
	}
	
	function endStateEffect(effect) {
		var existingEffect = effects[effect.className];
		effects[effect.className] = null;
		if(existingEffect != null) {
			clearTimeout(existingEffect);
			effect.end && effect.end(dude);
		}
	}
	
	function handleNewEntity(entity) {
		stuff.push(entity);
	}
	
	function handleRemoveEntity(entity) {
		for(var i in stuff) {
			if(stuff[i] == entity) {
				stuff.splice(i, 1);
				return;
			}
		}
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
				if(theDragon && type.dragonEffect) {
					effect = 'dragon:' + type.dragonEffect;
				} else {
					for(var b in type.nightEffect) {
						if(b == "default" || GameState.hasBuilding(Content.getBuildingType(b))) {
							effect = type.nightEffect[b];
							break;
						}
					}
				}
				if(effect != null) {
					var nightEffect = effect.split(':');
					switch(nightEffect[0]) {
					case "dragon":
						doDragonAttack(nightEffect[1]);
						break;
					case "spawn":
						spawnMonster(nightEffect[1], resourcesGained[typeName], side);
						break;
					case "shield":
						fillDefense();
						break;
					case "sword":
						fillAttack();
						break;
					}
				}
			} else {
				var quantity = resourcesGained[typeName];
				// Record
				if(recorded != null) {
					recorded += quantity;
				} 
				// Apply building multipliers
				if(type.multipliers) {
					for(var b in type.multipliers) {
						var bType = Content.getBuildingType(b);
						if(GameState.hasBuilding(bType, true)) {
							quantity *= type.multipliers[b];
						}
					}
				}
				// Apply debug multiplier
				quantity *= _debugMultiplier;
				
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

		// Cheap hack to implement pause
		if(require('app/engine').paused) return;

		if(hasteTick && World.hasEffect('haste') && !dude.paused) {
			runEntity(dude);
		} else if(!hasteTick) {
			var numEnemies = 0;
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
					if(entity.hostile) {
						numEnemies++;
					}
				} else if(entity.hostile) {
					if(isNight && !entity.wiped) {
						dude.gainXp(entity.getXp() * _debugMultiplier);
						advanceTime();
					}
					EventManager.trigger('monsterKilled', [entity]);
					GameState.count('KILLED', 1);
					stuff.splice(i, 1);
					i--;
				} else if(entity.lootable) {
					stuff.splice(i, 1);
					i--;
				} else if(entity == dude) {
					// Dude is dead. Long live the dude.
					stuff.splice(i, 1);
					i--;
					inTransition = true;
					GameState.count('DEATHS', 1);
					GameState.savePersistents();
					Graphics.fadeOut(function() {
						setTimeout(function() {
							stuff.length = 0;
							Graphics.setNight(false);
						}, 500);
						setTimeout(function() {
							require('app/engine').init();
						}, 1900);
					});
				}
			}
			GameState.setIfHigher('ATONCE', numEnemies);
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
				EventManager.trigger('phaseChange', [!isNight]);
			} else {
				var worldWidth = Graphics.worldWidth();
				celestial.p(Math.floor(worldWidth / numSteps) * celestialPosition);
				Graphics.moveCelestial(celestial);
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

			console.log('casual night? ' + casualNight);

			// Open all chests
			stuff.forEach(function(thing) {
				if(thing.lootable) {
					EventManager.trigger('pickupLoot', [thing, World.getDebugMultiplier()]);
				}
			});
			theDragon = null;
			streak++;
			GameState.dayNumber++;
			GameState.count('NIGHTS', 1);
			GameState.setIfHigher('ROW', streak);
			GameState.save();
			Graphics.notifySave();
			EventManager.trigger('dayBreak', [GameState.dayNumber]);
			if(casualNight) {
				GameState.count('CASUALNIGHTS', 1);
			}
		} else {
			casualNight = require('app/gameoptions').get('casualMode', false);
		}
	}

	function difficultyToggle(casualMode) {
		if(isNight && casualMode) {
			casualNight = true;
		}
	}
	
	function damageAllMonsters(damage) {
		for(var i in stuff) {
			var entity = stuff[i];
			if(entity.hostile && entity.isAlive()) {
				entity.takeDamage(damage);
				if(!entity.isAlive() && !entity.isBoss) {
					entity.wiped = true;
				}
			}
		}
	}
	
	function wipeMonsters() {
		for(var i in stuff) {
			var entity = stuff[i];
			if(entity.hostile && entity.isAlive() && !entity.isBoss) {
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
	
	function hurtDude(amount) {
		if(dude != null) {
			dude.takeDamage(amount);
		}
	}
	
	function handleResourceStoreChanged(rows, cols) {
		if(!Resources.loaded) {
			Resources.init();
			launchCelestial();
			GameState.save();
			Graphics.notifySave();
		}
		Resources.setSize(rows, cols);
	}
	
	function callDragon() {
		theDragon = MonsterFactory.getMonster("dragon", { 
			flip: dude.p() >= Graphics.worldWidth() / 2, 
			target: dude ,
			multiplier: (GameState.prestige + 1) * PRESTIGE_MULTIPLIER
		});
		stuff.push(theDragon);
		theDragon.action = ActionFactory.getAction('Land');
		theDragon.action.doAction(theDragon);
		return theDragon;
	}
	
	function doDragonAttack(attackName) {
		theDragon.queueAttack(attackName);
	}
	
	return World;
});
