define(['jquery', 'app/graphics'], function($, Graphics) {
	return {
		options: {
			rows: 8,
			columns: 8
		},
		init: function(opts) {
			$.extend(this.options, opts);
			this.gems = [];
			Graphics.addToScreen(this);
		},
		
		el: function() {
			if(this._el == null) {
				this._el = Graphics.createBoard(this.options.rows, this.options.columns);
			}
			return this._el;
		}
	};
});
