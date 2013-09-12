define(['app/action/moveblock', 'app/action/raisebuilding'], function(MoveBlock, RaiseBuilding) {
	
	return {
		_actions: {
			"MoveBlock": MoveBlock,
			"RaiseBuilding": RaiseBuilding
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
