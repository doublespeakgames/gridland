define(['jquery', 'app/graphics', 'app/entity/building', 'app/gamecontent', 
        'app/gamestate', 'app/action/actionfactory', 'app/entity/monsterfactory'], 
		function($, Graphics, Building, Content, GameState, ActionFactory, MonsterFactory) {
	return {
		stuff: [],
		
		options: {
			// Nothing for now
		},
		init: function(opts) {
			$.extend(this.options, opts);
			this._el = null;
			this.dude = null;
			this.celestial = null;
			this.stuff.length = 0;
			Graphics.addToBoard(this);
			this.isNight = false;
			if(this.gameLoop != null) {
				clearInterval(this.gameLoop);
			}
			this.gameLoop = setInterval(this.makeStuffHappen, 200);
		},
		
		el: function() {
			if(this._el == null) {
				this._el = Graphics.newElement('world');
			}
			return this._el;
		},
		
		makeStuffHappen: function() {
			require(['app/world'], function(World) {
				var newStuff = [];
				for(var i = 0, len = World.stuff.length; i < len; i++) {
					var entity = World.stuff[i];
					entity.animate();
					if(entity.action != null) {
						entity.action.doFrameAction(entity.frame);
					}
					entity.think();
					if(!entity.gone) {
						newStuff.push(entity);
					} else if(entity.hostile && World.isNight) {
						World.dude.gainXp(entity.xp);
						World.advanceTime();
					} else if(entity == World.dude) {
						// Dude is dead. Long live the dude.
						Graphics.fadeOut(function() {
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
			require(['app/world', 'app/graphics', 'app/entity/dude', 'app/gamestate'], 
					function(World, Graphics, Dude, GameState) {
				var dude = World.dude = new Dude();
				World.stuff.push(dude);
				dude.animation(0);
				dude.animationOnce(7);
				Graphics.addToWorld(dude);
				dude.p(World.el().width() / 2);
				Graphics.setPosition(dude, dude.p());
				GameState.level = 1;
			});
		},
		
		launchCelestial: function() {
			require(['app/world', 'app/graphics', 'app/entity/celestial'], 
					function(World, Graphics, Celestial) {
				var celestial = World.celestial = new Celestial();
				World.stuff.push(celestial);
				celestial.animation(0);
				Graphics.addToWorld(celestial);
				Graphics.raiseCelestial(celestial);
			});
		},
		
		advanceTime: function() {
			if(this.celestial != null) {
				this.celestial.p(this.celestial.p() + 24);
				if(this.celestial.p() > $('.world').width()) {
					this.phaseTransition();
				} else {
					Graphics.moveCelestial(this.celestial, this.celestial.p());
				}
			}
		},
		
		phaseTransition: function() {
			for(var i in this.stuff) {
				var entity = this.stuff[i];
				if(entity.hostile) {
					entity.die();
				}
			}
			Graphics.phaseTransition(this.celestial);
			this.isNight = !this.isNight
			if(this.dude.action != null) {
				this.dude.action.terminateAction(this.dude);						
			}
			this.dude.shield = 0;
			this.dude.sword = 0;
			Graphics.updateShield(0, 0);
			Graphics.updateSword(0, 0);
			
			if(!this.isNight) {
				GameState.save();
				Graphics.notifySave();
			}
		},
		
		makeDudeHungry: function() {
			if(this.dude != null) {
				this.dude.takeDamage(1);
			}
		},
		
		healDude: function(amount) {
			if(this.dude != null) {
				this.dude.heal(amount);
			}
		},
		
		hasBuilding: function(type) {
			var building = GameState.getBuilding(type);
			return building != null && building.built;
		},
		
		/**
		 * Returns a function (with the dude as the only parameter) to give the dude something to do.
		 * Checks for buildable buildings, moveable resources, etc...
		 */
		getActivity: function() {
			if(this.isNight) {
				// Look for a monster to fight
				var closest = null;
				for(var i in this.stuff) {
					var thing = this.stuff[i];
					if(thing.hostile && thing.isAlive() && (closest == null || 
							(this.dude.distanceFrom(thing) < this.dude.distanceFrom(closest)))) {
						closest = thing;
					}
				}
				if(closest != null && this.dude.distanceFrom(closest) <= 1) {
					return ActionFactory.getAction("Attack", {
						target: closest
					});
				} else if(closest != null) {
					// Move closer
					return ActionFactory.getAction("MoveTo", {
						target: closest
					});
				}
			} else {
				// Look for buildable buildings first
				for(var t in Content.BuildingType) {
					var buildingType = Content.BuildingType[t];
					var building = GameState.getBuilding(buildingType);
					// Add it to the buildings list, if it should be available to build and it isn't.
					if(building == null && GameState.level >= buildingType.requiredLevel) {
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
							if(block.spaceLeft() == 0) {
								for(var resource in building.requiredResources) {
									var required = building.requiredResources[resource];
									if(required > 0 && resource == block.options.type.className) {
										// We can move this block!
										return ActionFactory.getAction("MoveBlock", {
											block: block,
											destination: building
										});
									}
								}
							}
						}
					}
				}
			}
			
			// Then give up, and return null
			return null;
		},
		
		addDefense: function(num) {
			this.dude.shield += num;
			if(this.dude.shield > this.dude.maxShield()) {
				this.dude.shield = this.dude.maxShield();
			}
			Graphics.updateShield(this.dude.shield, this.dude.maxShield());
		},
		
		addAttack: function(num) {
			this.dude.sword += num;
			if(this.dude.sword > this.dude.maxSword()) {
				this.dude.sword = this.dude.maxSword();
			}
			Graphics.updateSword(this.dude.sword, this.dude.maxSword());
		},
		
		spawnMonster: function(monsterType, power, side) {
			var monster = MonsterFactory.getMonster(monsterType, {power: power});
			Graphics.addMonster(monster, side);
			this.stuff.push(monster);
		}
	};
});
