define(['jquery'], function($) {
	
	var gameOptions = {
		musicVolume: 1,
		effectsVolume: 1,
		casualMode: false
	};
	
	var GameOptions = {
		get: function(optionName, defaultValue) {
			return gameOptions[optionName] == null ? defaultValue : gameOptions[optionName];
		},
		
		set: function(optionName, value) {
			gameOptions[optionName] = value;
			if(typeof Storage != 'undefined' && localStorage) {
				localStorage.gameOptions = JSON.stringify(gameOptions);
			}
			return value;
		},
		
		load: function() {
			try {
				var savedOptions = JSON.parse(localStorage.gameOptions);
				if(savedOptions) {
					$.extend(gameOptions, savedOptions);
				}
			} catch(e) {
				// Nothing
			}
		}
	};
	
	return GameOptions;
});