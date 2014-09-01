define(['app/action/action', 'app/eventmanager'], function(Action, E) {

	// NOTE: I really like the architecture of this action. I should move the "engine"
	//       of it into the base action and reimplement all actions as simple function queues.
	
	var HOUSE_POS = 50;

	var MoveBlock = function(options) {
		this.block = options.block;
		this.destination = options.destination;
	};
	MoveBlock.prototype = new Action();
	MoveBlock.constructor = MoveBlock;
	
	MoveBlock.prototype.doAction = function(dude) {
		var action = this;
		var S = require('app/gamestate'),
			C = require('app/gamecontent'),
			G = require('app/graphics/graphics'),
			E = require('app/eventmanager');

		this._functionQueue = [];
		this._currentFunction = null;
		var runNextFunction = function() {
			if(action._functionQueue.length === 0) {
				// Action is complete
				dude.action = null;
				return;
			}
			action._currentFunction = action._functionQueue.shift();
			action._currentFunction();
		};

		// Move to the house
		this._functionQueue.push(function() {
			dude.move(HOUSE_POS, runNextFunction);
		});

		// Pick up the block
		this._functionQueue.push(function() {
			E.trigger('blockUp');
			G.pickUpBlock(action.block);
			S.removeBlock(action.block);
			dude.carrying = action.block;
			runNextFunction();
		});

		// Move to the destination building
		this._functionQueue.push(function() {
			dude.move(action.destination.dudeSpot(), runNextFunction);
		});

		// Drop the block
		this._functionQueue.push(function() {
			dude.carrying = null;
			action.destination.requiredResources[action.block.options.type.className]--;
			E.trigger('blockDown', [action.block, action.destination]);
			runNextFunction();
		});

		runNextFunction();
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
	
	MoveBlock.prototype.reinitialize = function(dude) {
		console.log('reinitialize MoveBlock');
		require('app/graphics/graphics').stop(dude);
		this._currentFunction && this._currentFunction();
	}

	return MoveBlock;
});
