define(['app/entity/worldentity', 'app/gamecontent'], function(WorldEntity, Content) {
	
	var building = function(options) {
		this.options = $.extend({}, this.options, {
			type: Content.BuildingType.Shack
		}, options);
		
		this.p(this.options.type.position);
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
	
	return building;
});