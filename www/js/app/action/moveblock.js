define(['app/action/action'], function(Action) {
	
	var MoveBlock = function(options) {
		this.block = options.block;
		this.destination = options.destination;
	};
	MoveBlock.prototype = new Action();
	MoveBlock.constructor = MoveBlock;
	
	MoveBlock.prototype.doAction = function(dude) {
		var _action = this;
		require(['app/gamestate', 'app/gamecontent'], 
				function(GameState, Content) {
			dude.move(GameState.getBuilding(Content.BuildingType.Shack).dudeSpot(), function(dude) {
				require(['app/graphics'], function(Graphics) {
					if(_action.block.gone) return;
					Graphics.pickUpBlock(_action.block);
					dude.carrying = _action.block.el();
					GameState.removeBlock(_action.block);
					dude.move(_action.destination.dudeSpot(), function(dude) {
						require(['app/graphics'], function(Graphics) {
							Graphics.dropBlock(_action.block, _action.destination);
							dude.carrying = null;
							_action.destination.requiredResources[_action.block.options.type.className]--;
							dude.action = null;
						});
					});
				});
			});
		});
	};
	
	MoveBlock.prototype.terminateAction = function(dude) {
		var _action = this;
		require(['app/graphics', 'app/resources'], function(Graphics, Resources) {
			dude.animation(0);
			Graphics.stop(dude);
			Resources.returnBlock(_action.block);
			dude.carrying = null;
			dude.action = null;	
		});
	};
	
	return MoveBlock;
});
