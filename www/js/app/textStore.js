define(function() {
	
	var TextStore = function(locale) {
		var _this = this;
		locale = locale || 'en';
		require(['app/locale/' + locale], function(locale) {
			_this.locale = locale;
		});
	};
	
	TextStore.prototype.get = function(key) {
		return this.locale[key];
	};
	
	return TextStore;
});
