define(['app/entity/worldentity'], function(WorldEntity) {
	
	var building = function(options) {
		this.options = $.extend({}, this.options, {
			type: type.Shack
		}, options);
	};
	building.prototype = new WorldEntity({
		className: 'building'
	});
	building.constructor = building;
	
	building.prototype.el = function() {
		if(this._el == null) {
			this._el = WorldEntity.prototype.el.call(this).addClass(this.options.type.className);
		}
		return this._el;
	};
	
	building.prototype.dudeSpot = function() {
		return this.p() + this.el().width() / 2;
	};
	
	var type = building.TYPE = {
		Shack: {
			className: 'shack'
		}
	};
	
	return building;
});