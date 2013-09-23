define(['app/entity/building', 'app/entity/block'], function(Building, Block) {
	
	return {
		create: function() {
			this.buildings = [];
			this.stores = [];
			this.level = 0;
			this.xp = 0;
		},
		
		load: function() {
			try {
				var savedState = JSON.parse(localStorage.gameState);
				if(savedState) {
					this.buildings = [];
					for(var i in savedState.buildings) {
						this.buildings.push(Building.makeBuilding(savedState.buildings[i]));
					}
					this.stores = [];
					for (var i in savedState.stores) {
						this.stores.push(Block.makeBlock(savedState.stores[i]));
					}
					this.level = savedState.level;
					this.xp = savedState.xp;
				}
			} catch(e) {
				this.create();
			}
			return this;
		},
		
		save: function() {
			if(typeof Storage != 'undefined' && localStorage) {
				var state = {
					buildings: this.buildings,
					stores: this.stores,
					level: this.level,
					xp: this.xp
				};
				localStorage.gameState = JSON.stringify(state);
			}
			return this;
		},
		
		removeBlock: function(block) {
			this.stores.splice(this.stores.indexOf(block), 1);
		},
		
		getBuilding: function(type) {
			for(var i in this.buildings) {
				var building = this.buildings[i];
				if(building.options.type.className == type.className) {
					return building;
				}
			}
			return null;
		}
	};
});
