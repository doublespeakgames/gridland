define(['app/entity/worldentity', 'app/action/actionfactory'], 
		function(WorldEntity, ActionFactory) {
	
	var Zombie = function(options) {
		this.options = $.extend({}, this.options, {
			power: 3
		}, options);
		this.hostile = true;
		this.action = null;
	};
	Zombie.prototype = new WorldEntity({
		className: 'zombie',
		speed: 80
	});
	Zombie.constructor = Zombie;
	
	Zombie.prototype.think = function() {
		if(this.action == null) {
			var _this = this;
			require(['app/world'], function(World) {
				var action = null;
				if(_this.distanceFrom(World.dude) > 5) {
					_this.action = ActionFactory.getAction("MoveTo", {
						target: World.dude
					});
				} else {
					// TODO: Attack!
				}
				if(_this.action != null) {
					_this.action.doAction(_this);
				}
			});
		}
	};
	
	return Zombie;
});