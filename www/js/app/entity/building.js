define(['app/entity/worldentity', 'app/entity/block', 'app/gamecontent'], function(WorldEntity, Block, Content) {
	
	var Building = function(options) {
		this.options = $.extend({}, this.options, {
			type: Content.BuildingType.Shack,
			animationFrames: 1,
		}, options);
		
		if(this.options.type.animationFrames != null) {
			this.options.animationFrames = this.options.type.animationFrames;
		}
		this.requiredResources = {};
		for(var i in this.options.type.cost) {
			this.requiredResources[i] = this.options.type.cost[i];
		}
		
		if(this.options.type.defaultAnimation != null) {
			this.animationRow = this.options.type.defaultAnimation;
		}
		
		this.options.spriteName = this.options.type.spriteName;
		
		this.built = false;
		
		this.p(this.options.type.position);
	};
	Building.prototype = new WorldEntity({
		className: 'building'
	});
	Building.constructor = Building;
	
	Building.makeBuilding = function(savedBuilding) {
		// Refresh the type, in case it has been modified
		savedBuilding.options.type = Content.getBuildingType(savedBuilding.options.type.className);
		var building = new Building(savedBuilding.options);
		building.requiredResources = savedBuilding.requiredResources;
		building.built = savedBuilding.built;
		building.obsolete = savedBuilding.obsolete;
		return building;
	};
	
	Building.prototype.el = function() {
		if(this._el == null) {
			var G = require('app/graphics/graphics');
			this._el = WorldEntity.prototype.el.call(this).addClass(this.options.type.className);
			
			if(!this.built) {
				var resourceBars = G.make("resourceBars", "ul");
				resourceBars.data('building', this);
				var numTypes = 0;
				for(var r in this.options.type.cost) {
					numTypes++;
					resourceBars.append(G.createResourceBar(r, this.options.type.cost[r]));
				}
				resourceBars.addClass('bars-' + numTypes);
				this._el.append(resourceBars);
			}
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
	
	Building.prototype.getReplaces = function(State) {
		if(this.options.type.replaces) {
			return State.getBuilding(Content.getBuildingType(this.options.type.replaces));
		}
		return null;
	};
	
	return Building;
});