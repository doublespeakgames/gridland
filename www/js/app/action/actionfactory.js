define(['app/action/moveblock', 'app/action/raisebuilding', 'app/action/moveto', 'app/action/attack', 'app/action/die',
        'app/action/fastattack', 'app/action/shoot', 'app/action/getloot', 'app/action/climb'], 
		function(MoveBlock, RaiseBuilding, MoveTo, Attack, Die, FastAttack, Shoot, GetLoot, Climb) {
	
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
			"Climb": Climb
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
