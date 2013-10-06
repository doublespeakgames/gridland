define(['app/entity/zombie', 'app/entity/rat', 'app/entity/skeleton'], function(Zombie, Rat, Skeleton) {
	return {
		_monsters: {
			"zombie": Zombie,
			"rat": Rat,
			"skeleton": Skeleton
		},
		
		getMonster: function(name, options) {
			var monster = this._monsters[name];
			if(monster != null) {
				return new monster(options);
			}
			return null;
		}
	}
});