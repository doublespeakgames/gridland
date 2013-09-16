define(['app/action/action'], function(Action) {
	
	var Attack = function(options) {
		this.target = options.target;
	};
	Attack.prototype = new Action();
	Attack.constructor = Attack;
	
	Attack.prototype.doAction = function(entity) {
		entity.animationOnce(entity.p() < this.target.p() ? 7 : 6);
		entity.action = null;
	};
	
	Attack.prototype._checkEnemy = function() {
		
	};
	
	return Attack;
});