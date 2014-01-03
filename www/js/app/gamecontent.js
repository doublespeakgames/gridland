define({
	
	ResourceType: {
		Grain: {
			char: 'g',
			className: 'grain',
			nightEffect: {
				'castle': 'spawn:demon',
				'fort': 'spawn:earthElemental',
				'house': 'spawn:hauntedArmour',
				'default': 'spawn:zombie'
			},
			multipliers: {
				house: 2,
				fort: 3
			}
		},
		Wood: {
			char: 'w',
			className: 'wood',
			nightEffect: {
				'sawmill8': 'shield:9',
				'sawmill7': 'shield:8',
				'sawmill6': 'shield:7',
				'sawmill5': 'shield:6',
				'sawmill4': 'shield:5',
				'sawmill3': 'shield:4',
				'sawmill2': 'shield:3',
				'sawmill': 'shield:2',
				'default': 'shield:1'				
			},
			multipliers: {
				sawmill: 2,
				sawmill2: 2,
				sawmill3: 3,
				sawmill4: 3,
				sawmill5: 3,
				sawmill6: 4,
				sawmill7: 4,
				sawmill8: 4
			}
		},
		Stone: {
			char: 's',
			className: 'stone',
			nightEffect: {
				'blacksmith8': 'sword:9',
				'blacksmith7': 'sword:8',
				'blacksmith6': 'sword:7',
				'blacksmith5': 'sword:6',
				'blacksmith4': 'sword:5',
				'blacksmith3': 'sword:4',
				'blacksmith2': 'sword:3',
				'blacksmith': 'sword:2',
				'default': 'sword:1'
			},
			multipliers: {
				blacksmith: 2,
				blacksmith2: 2,
				blacksmith3: 3,
				blacksmith4: 3,
				blacksmith5: 3,
				blacksmith6: 4,
				blacksmith7: 4,
				blacksmith8: 4
			}
		},
		Clay: {
			char: 'c',
			className: 'clay',
			nightEffect: {
				'bricklayer4': 'spawn:imp',
				'bricklayer3': 'spawn:waterElemental',
				'bricklayer2': 'spawn:spider',
				'default': 'spawn:rat'
			},
			multipliers: {
				bricklayer: 2,
				bricklayer2: 3,
				bricklayer3: 4,
				bricklayer4: 5
			}
		},
		Cloth: {
			char: 'l',
			className: 'cloth',
			nightEffect: {
				'weaver4': 'spawn:warlock',
				'weaver3': 'spawn:fireElemental',
				'weaver2': 'spawn:lizardman',
				'default': 'spawn:skeleton'
			},
			multipliers: {
				weaver: 2,
				weaver2: 3,
				weaver3: 4,
				weaver4: 5
			}
		},
		Mana: {
			char: 'm',
			className: 'mana',
			nightEffect: {
				'default': 'spawn:lich',
			},
			multipliers: {}
		}
	},
	
	BuildingCallbacks: {
		'shack': function() {
			var e = require('app/eventmanager');
			e.trigger('resourceStoreChanged', [3, 3]);
		},
		
		'house': function() {
			var e = require('app/eventmanager');
			e.trigger('resourceStoreChanged', [4, 3]);
		},
		
		'fort': function() {
			var e = require('app/eventmanager');
			e.trigger('resourceStoreChanged', [4, 4]);
		},
		
		'castle': function() {
			var e = require('app/eventmanager');
			e.trigger('resourceStoreChanged', [5, 4]);
		},
		
		'tower': function() {
			var e = require('app/eventmanager');
			e.trigger('enableMagic');
		}
	},
	
	BuildingType: {
		Shack: {
			className: 'shack',
			position: 30,
			cost: {},
			requiredLevel: 1,
			animationFrames: 4,
			priority: 1
		},
		
		House: {
			className: 'house',
			position: 30,
			cost: {},
			requiredLevel: 4,
			animationFrames: 4,
			tileMod: 'grain',
			tileLevel: 2,
			replaces: 'shack',
			defaultAnimation: 1,
			priority: 1
		},
		
		Fort: {
			className: 'fort',
			position: 30,
			cost: {},
			requiredLevel: 7,
			animationFrames: 4,
			tileMod: 'grain',
			tileLevel: 3,
			replaces: 'house',
			defaultAnimation: 2,
			priority: 1
		},
		
		Castle: {
			className: 'castle',
			position: 30,
			cost: {},
			requiredLevel: 10,
			animationFrames: 4,
			tileMod: 'grain',
			tileLevel: 4,
			replaces: 'fort',
			defaultAnimation: 3,
			priority: 1
		},
		
		BrickLayer: {
			className: 'bricklayer',
			position: 90,
			cost: {
				stone: 5,
				wood: 5
			},
			requiredLevel: 1,
			priority: 1
		},
		
		Bricklayer2: {
			className: 'bricklayer2',
			position: 90,
			cost: {
				stone: 1,
				wood: 1,
				cloth: 1,
				clay: 5
			},
			requiredLevel: 1,
			tileMod: 'clay',
			tileLevel: 2,
			replaces: 'bricklayer',
			defaultAnimation: 1,
			priority: 4
		},
		
		Bricklayer3: {
			className: 'bricklayer3',
			position: 90,
			cost: {
				stone: 2,
				wood: 2,
				cloth: 2,
				clay: 8
			},
			requiredLevel: 1,
			tileMod: 'clay',
			tileLevel: 3,
			replaces: 'bricklayer2',
			defaultAnimation: 2,
			priority: 6
		},
		
		Bricklayer4: {
			className: 'bricklayer4',
			position: 90,
			cost: {
				stone: 4,
				wood: 4,
				cloth: 4,
				clay: 12
			},
			requiredLevel: 1,
			tileMod: 'clay',
			tileLevel: 4,
			replaces: 'bricklayer3',
			defaultAnimation: 3,
			priority: 8
		},
		
		Weaver: {
			className: 'weaver',
			position: 150,
			cost: { 
				stone: 4,
				wood: 4,
				clay: 2
			},
			requiredLevel: 1,
			priority: 2
		},
		
		Weaver2: {
			className: 'weaver2',
			position: 150,
			cost: {
				wood: 2,
				stone: 2,
				clay: 1,
				cloth: 3
			},
			requiredLevel: 1,
			tileMod: 'cloth',
			tileLevel: 2,
			replaces: 'weaver',
			defaultAnimation: 1,
			priority: 4
		},
		
		Weaver3: {
			className: 'weaver3',
			position: 150,
			cost: {
				wood: 4,
				stone: 4,
				clay: 2,
				cloth: 5
			},
			requiredLevel: 1,
			tileMod: 'cloth',
			tileLevel: 3,
			replaces: 'weaver2',
			defaultAnimation: 2,
			priority: 6
		},
		
		Weaver4: {
			className: 'weaver4',
			position: 150,
			cost: {
				wood: 5,
				stone: 5,
				clay: 5,
				cloth: 10
			},
			requiredLevel: 1,
			tileMod: 'cloth',
			tileLevel: 4,
			replaces: 'weaver3',
			defaultAnimation: 3,
			priority: 8
		},
		
		Blacksmith: {
			className: 'blacksmith',
			position: 210,
			cost: {
				stone: 2,
				clay: 2
			},
			requiredLevel: 1,
			tileMod: 'stone',
			tileLevel: 2,
			priority: 3
		},
		
		Blacksmith2: {
			className: 'blacksmith2',
			position: 210,
			cost: {
				stone: 4,
				clay: 2,
				cloth: 1
			},
			requiredLevel: 1,
			tileMod: 'stone',
			tileLevel: 3,
			replaces: 'blacksmith',
			defaultAnimation: 1,
			priority: 4
		},
		
		Blacksmith3: {
			className: 'blacksmith3',
			position: 210,
			cost: {
				stone: 6,
				clay: 3,
				cloth: 2
			},
			requiredLevel: 1,
			tileMod: 'stone',
			tileLevel: 4,
			replaces: 'blacksmith2',
			defaultAnimation: 2,
			priority: 5
		},
		
		Blacksmith4: {
			className: 'blacksmith4',
			position: 210,
			cost: {
				stone: 8,
				clay: 4,
				cloth: 2
			},
			requiredLevel: 1,
			tileMod: 'stone',
			tileLevel: 5,
			replaces: 'blacksmith3',
			defaultAnimation: 3,
			priority: 6
		},
		
		Blacksmith5: {
			className: 'blacksmith5',
			position: 210,
			cost: {
				stone: 10,
				clay: 5,
				cloth: 2
			},
			requiredLevel: 1,
			tileMod: 'stone',
			tileLevel: 6,
			replaces: 'blacksmith4',
			defaultAnimation: 4,
			priority: 7
		},
		
		Blacksmith6: {
			className: 'blacksmith6',
			position: 210,
			cost: {
				stone: 12,
				clay: 6,
				cloth: 3
			},
			requiredLevel: 1,
			tileMod: 'stone',
			tileLevel: 7,
			replaces: 'blacksmith5',
			defaultAnimation: 5,
			priority: 8
		},
		
		Blacksmith7: {
			className: 'blacksmith7',
			position: 210,
			cost: {
				stone: 16,
				clay: 8,
				cloth: 3
			},
			requiredLevel: 1,
			tileMod: 'stone',
			tileLevel: 8,
			replaces: 'blacksmith6',
			defaultAnimation: 6,
			priority: 9
		},
		
		Blacksmith8: {
			className: 'blacksmith8',
			position: 210,
			cost: {
				stone: 20,
				clay: 10,
				cloth: 5
			},
			requiredLevel: 1,
			tileMod: 'stone',
			tileLevel: 9,
			replaces: 'blacksmith7',
			defaultAnimation: 7,
			priority: 10
		},
		
		Sawmill: {
			className: 'sawmill',
			position: 270,
			cost: {
				wood: 2,
				clay: 2
			},
			requiredLevel: 1,
			tileMod: 'wood',
			tileLevel: 2,
			priority: 3
		},
		
		Sawmill2: {
			className: 'sawmill2',
			position: 270,
			cost: {
				wood: 4,
				clay: 2,
				cloth: 1
			},
			requiredLevel: 1,
			tileMod: 'wood',
			tileLevel: 3,
			replaces: 'sawmill',
			defaultAnimation: 1,
			priority: 4
		},
		
		Sawmill3: {
			className: 'sawmill3',
			position: 270,
			cost: {
				wood: 6,
				clay: 3,
				cloth: 2
			},
			requiredLevel: 1,
			tileMod: 'wood',
			tileLevel: 4,
			replaces: 'sawmill2',
			defaultAnimation: 2,
			priority: 5
		},
		
		Sawmill4: {
			className: 'sawmill4',
			position: 270,
			cost: {
				wood: 8,
				clay: 4,
				cloth: 2
			},
			requiredLevel: 1,
			tileMod: 'wood',
			tileLevel: 5,
			replaces: 'sawmill3',
			defaultAnimation: 3,
			priority: 6
		},
		
		Sawmill5: {
			className: 'sawmill5',
			position: 270,
			cost: {
				wood: 10,
				clay: 5,
				cloth: 2
			},
			requiredLevel: 1,
			tileMod: 'wood',
			tileLevel: 6,
			replaces: 'sawmill4',
			defaultAnimation: 4,
			priority: 7
		},
		
		Sawmill6: {
			className: 'sawmill6',
			position: 270,
			cost: {
				wood: 12,
				clay: 6,
				cloth: 3
			},
			requiredLevel: 1,
			tileMod: 'wood',
			tileLevel: 7,
			replaces: 'sawmill5',
			defaultAnimation: 5,
			priority: 8
		},
		
		Sawmill7: {
			className: 'sawmill7',
			position: 270,
			cost: {
				wood: 16,
				clay: 8,
				cloth: 3
			},
			requiredLevel: 1,
			tileMod: 'wood',
			tileLevel: 8,
			replaces: 'sawmill6',
			defaultAnimation: 6,
			priority: 9
		},
		
		Sawmill8: {
			className: 'sawmill8',
			position: 270,
			cost: {
				wood: 20,
				clay: 10,
				cloth: 5
			},
			requiredLevel: 1,
			tileMod: 'wood',
			tileLevel: 9,
			replaces: 'sawmill7',
			defaultAnimation: 7,
			priority: 10
		},
		
		Tower: {
			className: 'tower',
			position: 330,
			cost: {},
			requiredLevel: 1,
			priority: 1,
			test: function(State) {
				return State.gem >= 4;
			}
		}
	},
	
	LootType: {
		healthPotion: {
			onUse: function() {
				var E = require('app/eventmanager'),
					S = require('app/gamestate');
				E.trigger('healDude', [Math.floor(S.maxHealth() / 2)]);
			}
		},
		manaPotion: {
			onUse: function() {
				var E = require('app/eventmanager'),
					S = require('app/gamestate');
				E.trigger('gainMana', [Math.floor(S.maxMana() / 2)]);
			}
		},
		bomb: {
			onUse: function() {
				var E = require('app/eventmanager');
				E.trigger('wipeMonsters');
			}
		},
		equipment: {
			onUse: function() {
				var E = require('app/eventmanager');
				E.trigger('fillEquipment');
			}
		},
		dragon: {
			onUse: function() {
				console.log("TODO: SUMMON THE DRAGON!");
			}
		}
	},
	
	lootPools: {
		rare: ['bomb'],
		uncommon: ['equipment'],
		common: ['healthPotion']
	},
	
	StateEffects: {
		freezeTime: {
			className: 'freezeTime',
			duration: 15000
		},
		haste: {
			className: 'haste',
			duration: 30000
		}
	},
	
	Spells: {
		resetBoard: {
			onUse: function() {
				var E = require('app/eventmanager');
				E.trigger('refreshBoard');
			}
		},
		haste: {
			onUse: function() {
				var E = require('app/eventmanager'),
					C = require('app/gamecontent');
				E.trigger('newStateEffect', [C.StateEffects.haste]);
			}
		},
		phaseChange: {
			onUse: function() {
				var E = require('app/eventmanager');
				E.trigger('phaseChange');
			}
		},
		freezeTime: {
			onUse: function() {
				var E = require('app/eventmanager'),
					C = require('app/gamecontent');
				E.trigger('newStateEffect', [C.StateEffects.freezeTime]);
			}
		}
	},
	
	getResourceType: function(query) {
		for(var c in this.ResourceType) {
			if(query.length == 1 && query == this.ResourceType[c].char || 
					query == this.ResourceType[c].className) {
				return this.ResourceType[c];
			}
		}
		return null;
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
