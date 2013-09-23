define(['app/entity/worldentity', 'app/entity/block', 'app/gamecontent', 'app/graphics'], function(WorldEntity, Block, Content, Graphics) {
	
	var Building = function(options) {
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
	Building.prototype = new WorldEntity({
		className: 'building'
	});
	Building.constructor = Building;
	
	Building.makeBuilding = function(savedBuilding) {
		var building = new Building(savedBuilding.options);
		building.requiredResources = savedBuilding.requiredResources;
		building.built = savedBuilding.built;
		
		return building;
	};
	
	Building.prototype.el = function() {
		if(this._el == null) {
			this._el = WorldEntity.prototype.el.call(this).addClass(this.options.type.className)
				.append(Graphics.newElement("blockPile"));
		}
		return this._el;
	};
	
	Building.prototype.readyToBuild = function() {
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
	
	Building.prototype.dudeSpot = function() {
		return this.p() + this.el().width() / 2;
	};
	
	return Building;
});