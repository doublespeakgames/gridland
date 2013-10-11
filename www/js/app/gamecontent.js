define({
	
	ResourceType: {
		Grain: {
			className: 'grain',
			nightEffect: {
				'default': 'spawn:zombie'
			}
		},
		Wood: {
			className: 'wood',
			nightEffect: {
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
