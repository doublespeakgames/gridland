define(['app/entity/building', 'app/entity/block', 'app/analytics'], function(Building, Block, Analytics) {
	
	return {
		create: function() {
			this.buildings = [];
			this.stores = [];
			this.level = 1;
			this.xp = 0;
			Analytics.trackEvent('game', 'create');
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
				} else {
					this.create();
				}
			} catch(e) {
				this.create();
			}
			return this;
		},
		
		save: function() {
			if(typeof Storage != 'undefined' && localStorage) {
				var state = {
					buildings: [],
					stores: [],
					level: this.level,
					xp: this.xp
				};
				for(b in this.buildings) {
					var building = this.buildings[b];
					state.buildings.push(Building.makeBuilding(building));
				}
				for(s in this.stores) {
					var store = this.stores[s];
					state.stores.push(Block.makeBlock(store));
				}
				localStorage.gameState = JSON.stringify(state);
			}
			return this;
		},
		
		saveXp: function() {
			if(typeof Storage != 'undefined' && localStorage && localStorage.gameState) {
				var savedState = JSON.parse(localStorage.gameState);
				savedState.xp = this.xp;
				savedState.level = this.level;
				localStorage.gameState = JSON.stringify(savedState);
			}
		},
		
		removeBlock: function(block) {
			this.stores.splice(this.stores.indexOf(block), 1);
		},
		
		hasBuilding: function(type) {
			for(var i in this.buildings) {
				var building = this.buildings[i];
				if(building.options.type.className == type.className && building.built) {
					return true;
				}
			}
			return false;
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
