define(['app/action/moveblock', 'app/action/raisebuilding', 'app/action/moveto', 'app/action/attack', 'app/action/die'], 
		function(MoveBlock, RaiseBuilding, MoveTo, Attack, Die) {
	
	return {
		_actions: {
			"MoveBlock": MoveBlock,
			"RaiseBuilding": RaiseBuilding,
			"MoveTo": MoveTo,
			"Attack": Attack,
			"Die": Die
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
