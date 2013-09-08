define({
	
	ResourceType: {
		Grain: {
			className: 'grain'
		},
		Wood: {
			className: 'wood'
		},
		Stone: {
			className: 'stone'
		},
		Clay: {
			className: 'clay'
		},
		Gem: {
			className: 'gem'
		},
		Blank: {
			className: 'blank'
		}	
	},
	
	BuildingType: {
		Shack: {
			className: 'shack',
			position: 30,
			cost: {},
			requiredLevel: 1
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
				stone: 4,
				wood: 4,
				clay: 4
			},
			requiredLevel: 1
		}
	}
});
