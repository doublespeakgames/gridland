define(['app/action/action', 'app/gamecontent'], function(Action, Content) {
	
	var RaiseBuilding = function(options) {
		this.building = options.building;
		this.hammering = false;
	};
	RaiseBuilding.prototype = new Action();
	RaiseBuilding.constructor = RaiseBuilding;
	
	RaiseBuilding.prototype.doAction = function(dude) {
		var _action = this;
		dude.move(this.building.dudeSpot(), function(dude) {
			dude.animation(8);
			var World = require('app/world'),
				Graphics = require('app/graphics/graphics'),
				Content = require('app/gamecontent'),
				E = require('app/eventmanager');
			_action.hammering = true;
			Graphics.raiseBuilding(_action.building, function() {
				_action.building.built = true;
				E.trigger('buildingComplete', [_action.building]);
				dude.makeIdle();
				dude.action = null;
				var cb = Content.BuildingCallbacks[_action.building.options.type.className];
				if(cb) {
					cb();
				}
				// Remove replaced building, if necessary
				if(_action.building.options.type.replaces != null) {
					replaces = _action.building.getReplaces(require('app/gamestate'));
					World.removeBuilding(replaces);
				}
			});
		});
	};
	
	RaiseBuilding.prototype.doFrameAction = function(frame) {
		if(this.hammering && frame == 3) {
			require('app/eventmanager').trigger('bluntHit');
		}
	};

	RaiseBuilding.prototype.terminateAction = function(dude) {
		var _action = this;
		
		require(['app/graphics/graphics'], function(Graphics) {
			Graphics.stop(dude);
			dude.makeIdle();
			dude.action = null;
			Graphics.sinkBuilding(_action.building);			
		});
	};
	
	return RaiseBuilding; 
});
