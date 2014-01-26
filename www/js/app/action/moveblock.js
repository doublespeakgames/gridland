define(['app/action/action', 'app/eventmanager'], function(Action, E) {
	
	var MoveBlock = function(options) {
		this.block = options.block;
		this.destination = options.destination;
	};
	MoveBlock.prototype = new Action();
	MoveBlock.constructor = MoveBlock;
	
	MoveBlock.prototype.doAction = function(dude) {
		var _action = this;
		var S = require('app/gamestate'),
			C = require('app/gamecontent'),
			G = require('app/graphics/graphics'),
			E = require('app/eventmanager');
		dude.move(50, function(dude) {
			if(_action.block.gone) {
				dude.action = null;
				return;
			}
			E.trigger('blockUp');
			G.pickUpBlock(_action.block);
			dude.carrying = _action.block;
			S.removeBlock(_action.block);
			dude.move(_action.destination.dudeSpot(), function(dude) {
				G.dropBlock(_action.block, _action.destination);
				E.trigger('blockDown', [_action.destination]);
				dude.carrying = null;
				_action.destination.requiredResources[_action.block.options.type.className]--;
				dude.action = null;
			});
		});
	};
	
	MoveBlock.prototype.terminateAction = function(dude) {
		var Graphics = require('app/graphics/graphics'),
			Resources = require('app/resources');
		dude.makeIdle();
		Graphics.stop(dude);
		if(dude.carrying != null) {
			Resources.returnBlock(this.block);
			dude.carrying = null;
		}
		dude.action = null;	
	};
	
	return MoveBlock;
});
