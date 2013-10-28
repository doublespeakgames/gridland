define(["google-analytics"], function(ga) {
	return {
		
		init: function() {
			if(!this.initialized) {
				try {
					ga('create', 'UA-41314886-2', 'doublespeakgames.com');
					ga('send', 'pageview');
					this.initialized = true;
				} catch(e) {
					console.log("Failed to initialize Google Analytics: " + e.message);
				}
			}
		},
		
		trackPageView: function(uri) {
			if(this.initialized) {
				ga('send', 'event', 'pageView', uri);
			}
		},
		
		trackTiming: function(category, indentifier, time) {
			if(this.initialized) {
				time = time || new Date().getTime() - window.performance.timing.domComplete;
		        ga('send', 'timing', category, identifier, time);
			}
		},
		
		trackEvent: function(type, desc, val) {
			if(this.initialized) {
				ga('send', 'event', type, desc, val);
			}
		}
	};
});