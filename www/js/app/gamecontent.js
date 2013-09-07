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
		
		Mine: {
			className: 'mine', //TODO: Make a real sprite!
			position: 90,
			cost: {
				"stone": 4,
				"wood": 4
			},
			requiredLevel: 1
		}
	}
});
