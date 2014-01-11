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
		entity[func](this.useMove ? _action.target.p() : _action.target, function(entity) {
			require(['app/graphics/graphics'], function(Graphics) {
				entity.makeIdle();
				entity.action = null;
			});
		});
	};
	
	MoveTo.prototype.doFrameAction = function(frame) {
		var _this = this;
		require(['app/world'], function(W) {
			if(frame == 3 && _this._entity == W.getDude()) {
				// Reset the dude's move action every step to make sure he's
				// still doing the right thing.
				var closest = W.findClosestMonster();
				if(closest == null) {
					closest = W.findClosestLoot();
				}
				if(closest == null) {
					_this.terminateAction(_this._entity);
				} else if(closest != _this.target) {
					_this.target = closest;
					_this.doAction(_this._entity);
				}
			}
		});
	};
	
	return MoveTo;
});