define(['app/eventmanager'], function(E) {

	var hidden = null, visibilityChangeEvent = null;
	if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
		hidden = "hidden";
		visibilityChangeEvent = "visibilitychange";
	} else if (typeof document.mozHidden !== "undefined") {
		hidden = "mozHidden";
		visibilityChangeEvent = "mozvisibilitychange";
	} else if (typeof document.msHidden !== "undefined") {
		hidden = "msHidden";
		visibilityChange = "msvisibilitychange";
	} else if (typeof document.webkitHidden !== "undefined") {
		hidden = "webkitHidden";
		visibilityChangeEvent = "webkitvisibilitychange";
	}
	
	function visibilityChange(visibility) {
		if(visibility === false || (visibility == null && 
				document[hidden] && require('app/engine').isStarted())) {
			E.trigger('pause');
		}
	}
	
	if(hidden != null && window.addEventListener) {
		// Use the Page Visibility API
		document.addEventListener(visibilityChangeEvent, function() { visibilityChange(null); });
	} else {
		// Use old fashioned onblur/onfocus events
		window.onfocus = function() { visibilityChange(true); };
		window.onblur = function() { visibilityChange(false); };
	}
	
	var Visibility = {
		init: function() {
			// Nothing to do!
		},
		isReady: function() {
			return true;
		}
	};
	return Visibility;
});