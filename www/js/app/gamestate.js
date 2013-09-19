define({
	create: function() {
		this.buildings = [];
		this.stores = [];
		this.level = 0;
		this.xp = 0;
	},
	
	load: function() {
		// TODO
	},
	
	save: function() {
		// TODO
	},
	
	removeBlock: function(block) {
		this.stores.splice(this.stores.indexOf(block), 1);
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
