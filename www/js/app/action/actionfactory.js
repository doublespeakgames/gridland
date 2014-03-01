define(['app/action/moveblock', 'app/action/raisebuilding', 'app/action/moveto', 'app/action/attack', 'app/action/die',
        'app/action/fastattack', 'app/action/shoot', 'app/action/getloot', 'app/action/climb', 'app/action/lichspell',
        'app/action/teleport', 'app/action/dragon/land', 'app/action/dragon/bite'], 
		function(MoveBlock, RaiseBuilding, MoveTo, Attack, Die, FastAttack, Shoot, GetLoot, Climb, LichSpell,
				 Teleport, Land, Bite) {
	
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
			"Bite": Bite
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
