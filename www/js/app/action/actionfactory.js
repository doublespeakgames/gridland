define(['app/action/moveblock', 'app/action/raisebuilding', 'app/action/moveto', 'app/action/attack', 'app/action/die',
        'app/action/fastattack', 'app/action/shoot', 'app/action/getloot', 'app/action/climb', 'app/action/lichspell',
        'app/action/teleport', 'app/action/dragon/land', 'app/action/dragon/bite', 'app/action/dragon/fireball',
        'app/action/dragon/wingbuffet', 'app/action/slide', 'app/action/dragon/icebeam', 'app/action/dragon/fireblast',
        'app/action/dragon/die'], 
		function(MoveBlock, RaiseBuilding, MoveTo, Attack, Die, FastAttack, Shoot, GetLoot, Climb, LichSpell,
				 Teleport, Land, Bite, Fireball, WingBuffet, Slide, IceBeam, FireBlast, DragonDie) {
	
	return {
		_actions: {
			"MoveBlock": MoveBlock,
			"RaiseBuilding": RaiseBuilding,
			"MoveTo": MoveTo,
			"Attack": Attack,
			"FastAttack": FastAttack,
			"Shoot": Shoot,
			"Die": Die,
			"GetLoot": GetLoot,
			"Climb": Climb,
			"LichSpell": LichSpell,
			"Teleport": Teleport,
			"Land": Land,
			"Bite": Bite,
			"Fireball": Fireball,
			"WingBuffet": WingBuffet,
			"Slide": Slide,
			"IceBeam": IceBeam,
			"FireBlast": FireBlast,
			"DragonDie": DragonDie
		},
		
		getAction: function(actionName, options) {
			var action = this._actions[actionName];
			if(action != null) {
				return new action(options);
			}
			return null;
		}
	};
});
