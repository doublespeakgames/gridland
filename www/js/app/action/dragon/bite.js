define(['app/action/action'], function(Action) {
	
	var Bite = function(options) {
		if(options) {
			this.target = options.target;
		}
		this.timeouts = [];
	};
	Bite.prototype = new Action();
	Bite.constructor = Bite;
	
	Bite.prototype.doAction = function(entity) {
		entity.setPosture('aimbite', 600);
		this.timeouts.push(setTimeout(function() {
			entity.setPosture('bite', 200);
		}, 600));
		var target = this.target;
		this.timeouts.push(setTimeout(function() {
			if(entity.distanceFrom(target) < 5) {
				target.takeDamage(entity.getDamage(), entity);
				require('app/eventmanager').trigger('sharpHit');
			}
			entity.action = null;
		}, 800));
	};
	
	Bite.prototype.terminateAction = function(entity) {
		for(var i in this.timeouts) {
			clearTimeout(this.timeouts[i]);
		}
	};

	return Bite;
});