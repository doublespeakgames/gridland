define(['jquery', 'app/graphics', 'app/entity/building', 'app/gamecontent', 'app/gamestate', 'app/action/actionfactory'], 
		function($, Graphics, Building, Content, GameState, ActionFactory) {
	return {
		stuff: [],
		
		options: {
			// Nothing for now
		},
		init: function(opts) {
			$.extend(this.options, opts);
			Graphics.addToBoard(this);
			this.isNight = false;
			setInterval(this.makeStuffHappen, 200);
		},
		
		el: function() {
			if(this._el == null) {
				this._el = Graphics.newElement('world');
			}
			return this._el;
		},
		
		makeStuffHappen: function() {
			require(['app/world'], function(World) {
				for(var i = 0, len = World.stuff.length; i < len; i++) {
					var entity = World.stuff[i];
					entity.think();
					entity.animate();
				}
			});
		},
		
		launchDude: function() {
			require(['app/world', 'app/graphics', 'app/entity/dude', 'app/gamestate'], 
					function(World, Graphics, Dude, GameState) {
				var dude = World.dude = new Dude();
				World.stuff.push(dude);
				dude.animation(0);
				dude.animationOnce(3);
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
			Graphics.phaseTransition(this.celestial);
			this.isNight = !this.isNight
			if(this.dude.action != null) {
				this.dude.action.terminateAction(this.dude);						
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
				// TODO
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
		}
	};
});
