define(['app/action/action', 'app/eventmanager'], function(Action, E) {
	
	var MoveBlock = function(options) {
		this.block = options.block;
		this.destination = options.destination;
	};
	MoveBlock.prototype = new Action();
	MoveBlock.constructor = MoveBlock;
	
	MoveBlock.prototype.doAction = function(dude) {
		var _action = this;
		require(['app/gamestate', 'app/gamecontent'], 
				function(GameState, Content, World) {
			dude.move(50, function(dude) {
				require(['app/graphics/graphics'], function(Graphics) {
					if(_action.block.gone) {
						dude.action = null;
						return;
					}
					Graphics.pickUpBlock(_action.block);
					dude.carrying = _action.block;
					GameState.removeBlock(_action.block);
					dude.move(_action.destination.dudeSpot(), function(dude) {
						require(['app/graphics/graphics'], function(Graphics) {
							Graphics.dropBlock(_action.block, _action.destination);
							E.trigger('showCosts', [_action.destination]);
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
		require(['app/graphics/graphics', 'app/resources'], function(Graphics, Resources) {
			dude.makeIdle();
			Graphics.stop(dude);
			if(dude.carrying != null) {
				Resources.returnBlock(_action.block);
				dude.carrying = null;
			}
			dude.action = null;	
		});
	};
	
	return MoveBlock;
});
