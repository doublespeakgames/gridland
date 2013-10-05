define({
	
	ResourceType: {
		Grain: {
			className: 'grain',
			nightEffect: 'spawn:zombie'
		},
		Wood: {
			className: 'wood',
			nightEffect: 'shield:1'
		},
		Stone: {
			className: 'stone',
			nightEffect: 'sword:1'
		},
		Clay: {
			className: 'clay',
			nightEffect: 'spawn:rat'
		},
		Cloth: {
			className: 'cloth'
			// nightEffect: 'spawn:archer' TODO
		},
		Gem: {
			className: 'gem'
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
		
		Mine: {
			className: 'mine',
			position: 210,
			cost: {
				stone: 3,
				wood: 3,
				clay: 2,
				cloth: 2
			},
			requiredLevel: 2
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
