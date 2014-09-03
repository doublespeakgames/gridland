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
				
				var S = require('app/gamestate');
				
				E.bind('newGame', function() { trackEvent('game', 'new'); });
				E.bind('dayBreak', function(num) { trackEvent('daybreak', num, num); });
				E.bind('dudeDeath', function(monster) { trackEvent('death', monster, S.dayNumber); });
				E.bind('buildingComplete', function(building) { trackEvent('build', building.options.type.className, S.dayNumber); });
				E.bind('gameOver', function() { trackEvent('game', 'complete', S.dayNumber); });
				E.bind('levelUp', function(level) { trackEvent('levelup', level, S.dayNumber); });
				E.bind('click', function(thing) { trackEvent('click', thing); });
				E.bind('prestige', function() { trackEvent('game', 'prestige'); });
				E.bind('keySequenceComplete', function() { trackEvent('game', 'codeEntered'); });
			}
		}
	};
});