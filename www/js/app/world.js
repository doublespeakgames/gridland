define(['jquery', 'app/graphics', 'app/entity/dude', 'app/entity/building', 'app/gamecontent'], function($, Graphics, Dude, Building, Content) {
	return {
		stuff: [],
		
		options: {
			// Nothing for now
		},
		init: function(opts) {
			$.extend(this.options, opts);
			Graphics.addToBoard(this);
			setInterval(this.makeStuffHappen, 200);
		},
		
		el: function() {
			if(this._el == null) {
				this._el = Graphics.newElement('world');
			}
			return this._el;
		},
		
		makeStuffHappen: function() {
			require(['app/world'], function(World) {
				for(var i = 0, len = World.stuff.length; i < len; i++) {
					var entity = World.stuff[i];
					entity.think();
					entity.animate();
				}
			});
		},
		
		launchDude: function() {
			var dude = this.dude = new Dude();
			this.stuff.push(dude);
			dude.animation(0);
			dude.animationOnce(3);
			Graphics.addToWorld(dude);
			dude.p(this.el().width() / 2);
			Graphics.setPosition(dude, dude.p());
		},
		
		launchCity: function() {
			var b = new Building({
				type: Content.BuildingType.Shack
			});
			this.build(b, function() {
				require(['app/resources'], function(R) {
					R.init();
				});
			});
		},
		
		build: function(building, callback) {
			this.dude.move(building.dudeSpot(), function(dude) {
				dude.animation(4);
				require(["app/graphics"], function(Graphics) {
					Graphics.raiseBuilding(building, function() {
						dude.animation(0);
						if(callback != null) {
							callback();
						}
					});
				});
			});
		}
	};
});
