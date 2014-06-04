define(["google-analytics", "app/eventmanager"], function(ga, E) {
	
	function trackPageView(uri) {
		if(initialized) {
			ga('send', 'event', 'pageView', uri);
		}
	}
	
	function trackTiming(category, indentifier, time) {
		if(initialized) {
			time = time || new Date().getTime() - window.performance.timing.domComplete;
	        ga('send', 'timing', category, identifier, time);
		}
	}
	
	function trackEvent(type, desc, val) {
		if(initialized) {
			ga('send', 'event', type, desc, val);
		}
	}
	
	var initialized = false;
	return {
		init: function() {
			if(!initialized) {
				try {
					ga('create', 'UA-41314886-2', 'doublespeakgames.com');
					ga('send', 'pageview');
					initialized = true;
				} catch(e) {
					console.log("Failed to initialize Google Analytics: " + e.message);
				}
			}
			
			if(initialized) {
				E.bind('newGame', function() { trackEvent('game', 'newgame'); });
				E.bind('dayBreak', function(num) { trackEvent('game', 'daybreak', num); });
				E.bind('dudeDeath', function(monster) { trackEvent('game', 'death', monster); });
				E.bind('buildingComplete', function(building) { trackEvent('game', 'build', building.options.type.className); });
				E.bind('gameOver', function() { trackEvent('game', 'complete'); });
				E.bind('levelUp', function(level) { trackEvent('game', 'levelup', level); });
				E.bind('click', function(thing) { trackEvent('click', thing); });
				E.bind('prestige', function() { trackEvent('game', 'prestige'); });
			}
		}
	};
});