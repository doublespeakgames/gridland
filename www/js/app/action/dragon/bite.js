define(['app/action/action'], function(Action) {
	
	var Bite = function(options) {
		if(options) {
			this.target = options.target;
		}
	};
	Bite.prototype = new Action();
	Bite.constructor = Bite;
	
	Bite.prototype.doAction = function(entity) {
		entity.setPosture('aimbite', 600);
		setTimeout(function() {
			entity.setPosture('bite', 200);
		}, 600);
		var target = this.target;
		setTimeout(function() {
			if(entity.distanceFrom(target) < 5) {
				target.takeDamage(entity.getDamage());
			}
			entity.action = null;
		}, 800);
	};

	return Bite;
});