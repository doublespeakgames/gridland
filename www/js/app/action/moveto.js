define(['app/action/action'], function(Action) {
	
	var MoveTo = function(options) {
		this.target = options.target;
	};
	MoveTo.prototype = new Action();
	MoveTo.constructor = MoveTo;
	
	MoveTo.prototype.doAction = function(entity) {
		var _action = this;
		this._entity = entity;
		entity.moveTo(_action.target, function(entity) {
			require(['app/graphics'], function(Graphics) {
				entity.animation(0);
				entity.action = null;
			});
		});
	};
	
	MoveTo.prototype.doFrameAction = function(frame) {
		var _this = this;
		require(['app/world'], function(W) {
			if(frame == 3 && _this._entity == W.dude) {
				// Reset the dude's move action every step to make sure he's
				// attacking the closest enemy all the time
				var closest = W.findClosestMonster();
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