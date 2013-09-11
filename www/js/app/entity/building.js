define(['app/entity/worldentity', 'app/gamecontent', 'app/graphics'], function(WorldEntity, Content, Graphics) {
	
	var building = function(options) {
		this.options = $.extend({}, this.options, {
			type: Content.BuildingType.Shack,
			animationFrames: 1
		}, options);
		
		if(this.options.type.animationFrames != null) {
			this.options.animationFrames = this.options.type.animationFrames;
		}
		this.requiredResources = {};
		for(var i in this.options.type.cost) {
			this.requiredResources[i] = this.options.type.cost[i];
		}
		
		this.built = false;
		
		this.p(this.options.type.position);
	};
	building.prototype = new WorldEntity({
		className: 'building'
	});
	building.constructor = building;
	
	building.prototype.el = function() {
		if(this._el == null) {
			this._el = WorldEntity.prototype.el.call(this).addClass(this.options.type.className)
				.append(Graphics.newElement("blockPile"));
		}
		return this._el;
	};
	
	building.prototype.readyToBuild = function() {
		if(this.built) {
			return false;
		}
		for(var r in this.requiredResources) {
			if(this.requiredResources[r] > 0) {
				return false;
			}
		}
		return true;
	};
	
	building.prototype.dudeSpot = function() {
		return this.p() + this.el().width() / 2;
	};
	
	return building;
});