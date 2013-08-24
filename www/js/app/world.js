define(['jquery'], function($) {
	return {
		options: {
			// Nothing for now
		},
		init: function(opts) {
			$.extend(this.options, opts);
			this.el = this.createElement();
			return this.el;
		},
		
		createElement: function() {
			return $('<div>').addClass('world');
		}
	};
});
