define(['jquery'], function($) {
	return {
		options: {
			rows: 8,
			columns: 8
		},
		init: function(opts) {
			$.extend(this.options, opts);
			this.gems = [];
			this.el = this.createBoard();
			return this.el;
		},
		
		createBoard: function() {
			// Generate the board element
			var el = $('<div>').addClass('gameBoard');
			// Determine the board dimensions based on the size of the gems
			var testGem = $('<div>').addClass('gem').hide().appendTo('body');
			el.width(testGem.width() * this.options.columns);
			el.height(testGem.height() * this.options.rows);
			testGem.remove();
			
			return el;
		}
	};
});
