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
		
		Mine: {
			className: 'mine',
			position: 150,
			cost: {
				stone: 3,
				wood: 3,
				clay: 4
			},
			requiredLevel: 1
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
