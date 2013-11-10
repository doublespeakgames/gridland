define(['app/entity/zombie', 'app/entity/rat', 'app/entity/skeleton',
        'app/entity/hauntedarmour', 'app/entity/lizardman', 'app/entity/spider',
        'app/entity/earthelemental'], 
        function(Zombie, Rat, Skeleton, HauntedArmour, Lizardman, Spider, EarthElemental) {
	return {
		_monsters: {
			"zombie": Zombie,
			"rat": Rat,
			"skeleton": Skeleton,
			"hauntedArmour": HauntedArmour,
			"lizardman": Lizardman,
			"spider": Spider,
			"earthElemental": EarthElemental
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