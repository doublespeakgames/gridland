define(['app/entity/monster/zombie', 'app/entity/monster/rat', 'app/entity/monster/skeleton',
        'app/entity/monster/hauntedarmour', 'app/entity/monster/lizardman', 'app/entity/monster/spider',
        'app/entity/monster/earthelemental', 'app/entity/monster/fireelemental', 'app/entity/monster/waterelemental',
        'app/entity/monster/demon', 'app/entity/monster/warlock', 'app/entity/monster/imp',
        'app/entity/monster/lich'], 
        function(Zombie, Rat, Skeleton, HauntedArmour, Lizardman, Spider, 
        		EarthElemental, FireElemental, WaterElemental,
        		Demon, Warlock, Imp, Lich) {
	return {
		_monsters: {
			"zombie": Zombie,
			"rat": Rat,
			"skeleton": Skeleton,
			"hauntedArmour": HauntedArmour,
			"lizardman": Lizardman,
			"spider": Spider,
			"earthElemental": EarthElemental,
			"fireElemental": FireElemental,
			"waterElemental": WaterElemental,
			"demon": Demon,
			"warlock": Warlock,
			"imp": Imp,
			"lich": Lich
		},
		
		getMonster: function(name, options) {
			var monster = this._monsters[name];
			if(monster != null) {
				return new monster(options);
			}
			return null;
		}
	};
});