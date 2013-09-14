define(['app/action/action'], function(Action) {
	
	var MoveTo = function(options) {
		this.target = options.target;
	};
	MoveTo.prototype = new Action();
	MoveTo.constructor = MoveTo;
	
	MoveTo.prototype.doAction = function(entity) {
		var _action = this;
		require(['app/gamestate', 'app/gamecontent'], 
				function(GameState, Content) {
			entity.moveTo(_action.target, function(entity) {
				require(['app/graphics'], function(Graphics) {
					entity.animation(0);
					entity.action = null;
				});
			});
		});
	};
	
	MoveTo.prototype.terminateAction = function(dude) {
		require(['app/graphics'], function(Graphics) {
			dude.animation(0);
			Graphics.stop(dude);
			dude.action = null;	
		});
	};
	
	return MoveTo;
});