define(['jquery', 'app/graphics', 'app/entity/dude'], function($, Graphics, Dude) {
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
		}
	};
});
