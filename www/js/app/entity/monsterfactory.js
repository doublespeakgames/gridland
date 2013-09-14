define(['app/entity/zombie'], function(Zombie) {
	return {
		_monsters: {
			"zombie": Zombie
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