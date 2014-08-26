define(['app/action/action'], function(Action) {
	
	var MoveTo = function(options) {
		this.target = options.target;
		this.useMove = options.useMove;
	};
	MoveTo.prototype = new Action();
	MoveTo.constructor = MoveTo;
	
	MoveTo.prototype.doAction = function(entity) {
		var _action = this;
		this._entity = entity;
		var func = this.useMove ? "move" : "moveTo";
		this._dir = whichSide(entity, this.target);
		entity[func](this.useMove ? _action.target.p() : _action.target, (function(entity) {
			entity.makeIdle();
			if(entity.action == this) {
				entity.action = null;
			}
		}).bind(this));
	};
	
	MoveTo.prototype.doFrameAction = function(frame) {
		var _this = this;
		var W = require('app/world');
		if(frame == 3 && this._entity == W.getDude()) {
			// Reset the dude's move action every step to make sure he's
			// still doing the right thing.
			var closest = W.findClosestMonster() || W.findClosestLoot();
			if(closest == null) {
				this.terminateAction(this._entity);
			} else if(closest != this.target || 
					whichSide(this._entity, this.target) != this._dir) {
				this.target = closest;
				this.doAction(this._entity);
			}
		}
	};

	function whichSide(entity, target) {
		return entity.p() < target.p() ? 'right' : 'left'; 
	}
	
	return MoveTo;
});