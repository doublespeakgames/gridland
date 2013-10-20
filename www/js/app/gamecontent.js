define({
	
	ResourceType: {
		Grain: {
			className: 'grain',
			nightEffect: {
				'house': 'spawn:hauntedArmour',
				'default': 'spawn:zombie'
			},
			multipliers: {
				house: 2,
				fort: 3
			}
		},
		Wood: {
			className: 'wood',
			nightEffect: {
				'sawmill2': 'shield:3',
				'sawmill': 'shield:2',
				'default': 'shield:1'				
			},
			multipliers: {
				sawmill: 2
			}
		},
		Stone: {
			className: 'stone',
			nightEffect: {
				'blacksmith2': 'sword:3',
				'blacksmith': 'sword:2',
				'default': 'sword:1'
			},
			multipliers: {
				blacksmith: 2
			}
		},
		Clay: {
			className: 'clay',
			nightEffect: {
				'default': 'spawn:rat'
			}
		},
		Cloth: {
			className: 'cloth',
			nightEffect: {
				'default': 'spawn:skeleton'
			}
		}
	},
	
	getResourceType: function(className) {
		for(var c in this.ResourceType) {
			if(className == this.ResourceType[c].className) {
				return this.ResourceType[c];
			}
		}
		return null;
	},
	
	BuildingCallbacks: {
		'shack': function() {
			require(['app/resources', 'app/world'], function(R, W) {
				R.init();
				W.launchCelestial();
			});
		},
		
		'house': function() {
			require(['app/resources', 'app/world'], function(R, W) {
				if(!R.loaded) {
					R.init();
					W.launchCelestial();
				}
				R.setSize(4, 3);
			});
		},
		
		'fort': function() {
			require(['app/resources', 'app/world'], function(R, W) {
				if(!R.loaded) {
					R.init();
					W.launchCelestial();
				}
				R.setSize(4, 4);
			});
		},
		
		'castle': function() {
			require(['app/resources', 'app/world'], function(R, W) {
				if(!R.loaded) {
					R.init();
					W.launchCelestial();
				}
				R.setSize(5, 4);
			});
		}
	},
	
	BuildingType: {
		Shack: {
			className: 'shack',
			position: 30,
			cost: {},
			requiredLevel: 1,
			animationFrames: 4
		},
		
		House: {
			className: 'house',
			position: 30,
			cost: {},
			requiredLevel: 3,
			animationFrames: 4,
			tileMod: 'grain',
			tileLevel: 2,
			replaces: 'shack',
			defaultAnimation: 1
		},
		
		Fort: {
			className: 'fort',
			position: 30,
			cost: {},
			requiredLevel: 6,
			animationFrames: 4,
			tileMod: 'grain',
			tileLevel: 3,
			replaces: 'house',
			defaultAnimation: 2
		},
		
		Castle: {
			className: 'castle',
			position: 30,
			cost: {},
			requiredLevel: 9,
			animationFrames: 4,
			tileMod: 'grain',
			tileLevel: 4,
			replaces: 'fort',
			defaultAnimation: 3
		},
		
		BrickLayer: {
			className: 'bricklayer',
			position: 90,
			cost: {
				stone: 5,
				wood: 5
			},
			requiredLevel: 1
		},
		
		Weaver: {
			className: 'weaver',
			position: 150,
			cost: { 
				stone: 4,
				wood: 4,
				clay: 2
			},
			requiredLevel: 1
		},
		
		Blacksmith: {
			className: 'blacksmith',
			position: 210,
			cost: {
				stone: 3,
				clay: 1,
				cloth: 1
			},
			requiredLevel: 2,
			tileMod: 'stone',
			tileLevel: 2
		},
		
		Blacksmith2: {
			className: 'blacksmith2',
			position: 210,
			cost: {
				stone: 6,
				clay: 1,
				cloth: 1
			},
			requiredLevel: 2,
			tileMod: 'stone',
			tileLevel: 3,
			replaces: 'blacksmith',
			defaultAnimation: 1
		},
		
		Sawmill: {
			className: 'sawmill',
			position: 270,
			cost: {
				wood: 3,
				clay: 1,
				cloth: 1
			},
			requiredLevel: 2,
			tileMod: 'wood',
			tileLevel: 2
		},
		
		Sawmill2: {
			className: 'sawmill2',
			position: 270,
			cost: {
				wood: 6,
				clay: 1,
				cloth: 1
			},
			requiredLevel: 2,
			tileMod: 'wood',
			tileLevel: 3,
			replaces: 'sawmill',
			defaultAnimation: 1
		}
	},
	
	getBuildingType: function(className) {
		for(var c in this.BuildingType) {
			if(className == this.BuildingType[c].className) {
				return this.BuildingType[c];
			}
		}
		return null;
	}
});
