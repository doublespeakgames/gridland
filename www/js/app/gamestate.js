define({
	create: function() {
		this.buildings = [];
		this.stores = [];
		this.level = 0;
	},
	
	load: function() {
		// TODO
	},
	
	save: function() {
		// TODO
	},
	
	getBuilding: function(type) {
		for(var i in this.buildings) {
			var building = this.buildings[i];
			if(building.options.type == type) {
				return building;
			}
		}
		return null;
	}
});
