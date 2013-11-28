define(['app/entity/building', 'app/entity/block', 'app/analytics', 'app/gamecontent'], 
		function(Building, Block, Analytics, Content) {
	
	return {
		create: function() {
			this.buildings = [];
			this.stores = [];
			this.level = 1;
			this.xp = 0;
			this.dayNumber = 1;
			this.items = {};
			this.gem = 0;
			this.mana = 0;
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
					this.items = savedState.items || {};
					this.level = savedState.level;
					this.xp = savedState.xp;
					this.dayNumber = savedState.dayNumber || 1;
					this.gem = savedState.gem || 0;
					this.mana = savedState.mana || 0;
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
					xp: this.xp,
					dayNumber: this.dayNumber,
					items: this.items,
					gem: this.gem,
					mana: this.mana
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
		
		hasBuilding: function(type, ignoreObsolete) {
			for(var i in this.buildings) {
				var building = this.buildings[i];
				if(building.options.type.className == type.className && building.built && 
						(!ignoreObsolete || !building.obsolete)) {
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
		},
		
		maxHealth: function() {
			return 20 + 10 * this.level;
		},
		
		maxMana: function() {
			return 0; // TODO
		},
		
		maxShield: function() {
			if(this.hasBuilding(Content.BuildingType.Sawmill8)) {
				return 27;
			}
			if(this.hasBuilding(Content.BuildingType.Sawmill7)) {
				return 24;
			}
			if(this.hasBuilding(Content.BuildingType.Sawmill6)) {
				return 21;
			}
			if(this.hasBuilding(Content.BuildingType.Sawmill5)) {
				return 18;
			}
			if(this.hasBuilding(Content.BuildingType.Sawmill4)) {
				return 15;
			}
			if(this.hasBuilding(Content.BuildingType.Sawmill3)) {
				return 12;
			}
			if(this.hasBuilding(Content.BuildingType.Sawmill2)) {
				return 9;
			}
			if(this.hasBuilding(Content.BuildingType.Sawmill)) {
				return 6;
			}
			return 3;
		},
		
		maxSword: function() {
			if(this.hasBuilding(Content.BuildingType.Blacksmith8)) {
				return 27;
			}
			if(this.hasBuilding(Content.BuildingType.Blacksmith7)) {
				return 24;
			}
			if(this.hasBuilding(Content.BuildingType.Blacksmith6)) {
				return 21;
			}
			if(this.hasBuilding(Content.BuildingType.Blacksmith5)) {
				return 18;
			}
			if(this.hasBuilding(Content.BuildingType.Blacksmith4)) {
				return 15;
			}
			if(this.hasBuilding(Content.BuildingType.Blacksmith3)) {
				return 12;
			}
			if(this.hasBuilding(Content.BuildingType.Blacksmith2)) {
				return 9;
			}
			if(this.hasBuilding(Content.BuildingType.Blacksmith)) {
				return 6;
			}
			return 3;
		},
		
		maxMana: function() {
			return 3;
		},
		
		magicEnabled: function() {
			return this.gem >= 4;
		}
	};
});
