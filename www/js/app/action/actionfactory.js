define(['app/action/moveblock', 'app/action/raisebuilding', 'app/action/moveto'], 
		function(MoveBlock, RaiseBuilding, MoveTo) {
	
	return {
		_actions: {
			"MoveBlock": MoveBlock,
			"RaiseBuilding": RaiseBuilding,
			"MoveTo": MoveTo
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
