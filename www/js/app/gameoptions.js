define(function() {
	
	var _options = {
		showCosts: false
	};
	
	return {
		get: function(optionName) {
			return _options[optionName];
		},
		
		set: function(optionName, value) {
			_options[optionName] = value;
			return value;
		}
	};
});