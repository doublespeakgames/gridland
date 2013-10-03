define(['app/entity/zombie', 'app/entity/rat'], function(Zombie, Rat) {
	return {
		_monsters: {
			"zombie": Zombie,
			"rat": Rat
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