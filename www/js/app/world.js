define(['jquery', 'app/graphics', 'app/entity/building', 'app/gamecontent', 'app/gamestate'], 
		function($, Graphics, Building, Content, GameState) {
	return {
		stuff: [],
		
		options: {
			// Nothing for now
		},
		init: function(opts) {
			$.extend(this.options, opts);
			Graphics.addToBoard(this);
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
				var dude = this.dude = new Dude();
				World.stuff.push(dude);
				dude.animation(0);
				dude.animationOnce(3);
				Graphics.addToWorld(dude);
				dude.p(World.el().width() / 2);
				Graphics.setPosition(dude, dude.p());
				GameState.level = 1;
			});
		},
		
		/**
		 * Returns a function (with the dude as the only parameter) to give the dude something to do.
		 * Checks for buildable buildings, moveable resources, etc...
		 */
		getActivity: function() {
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
				}
				
				// If it's ready to build, build it.
				if(building != null && building.readyToBuild()) {
					return function(dude) {
						dude.move(building.dudeSpot(), function(dude) {
							dude.animation(4);
							require(["app/graphics", "app/gamecontent", 'app/resources'], function(Graphics, Content, R) {
								Graphics.raiseBuilding(building, function() {
									building.built = true;
									dude.animation(0);
									// The Shack initializes the resource grid
									if(building.options.type == Content.BuildingType.Shack) {
										R.init();
									}
								});
							});
						});
					}
				}
			}
			
			// Then look for moveable resources
			// TODO
			
			// Then give up, and return null
			return null;
		}
	};
});
