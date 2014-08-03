define(['app/action/action'], function(Action) {
	
	var LichSpell = function(options) {
		if(options) {
			this.target = options.target;
		}
	};
	LichSpell.prototype = new Action();
	LichSpell.constructor = LichSpell;
	
	LichSpell.prototype.doAction = function(entity) {
		this._entity = entity;
		var animation;
		if(entity.p() < this.target.p()) {
			animation = 7;
			this.lastDir = "right";
		} else {
			animation = 8;
			this.lastDir = "left";
		}
		entity.animationOnce(animation);
	};
	
	LichSpell.prototype.doFrameAction = function(frame) {
		if(frame == 3) {
			require('app/gameboard').addEffectRandomly('explosive');
			require('app/eventmanager').trigger('lichSpell');
			this._entity.action = null;
		}
	};
	
	return LichSpell;
});