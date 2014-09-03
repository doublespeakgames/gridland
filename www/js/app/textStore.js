define(function() {
	
	var TextStore = function(locale) {
		var _this = this;
		locale = locale || 'en';
		require(['app/locale/' + locale], function(l) {
			_this.locale = l;
		});
	};
	
	TextStore.prototype.get = function(key) {
		return this.locale[key];
	};
	
	TextStore.prototype.isReady = function() {
		return this.locale != null;
	};
	
	return TextStore;
});
