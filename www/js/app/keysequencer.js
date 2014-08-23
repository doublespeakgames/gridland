define(['app/eventmanager'], function(EventManager) {

	var TIME_WINDOW = 1000; // in millis
	var SEQUENCE = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65, 13];
	var currentPosition, timeout;

	function checkSequence(e) {
		e = e || window.event;
		if(timeout) {
			clearTimeout(timeout);
			timeout = null;
		}

		if(e.keyCode == SEQUENCE[currentPosition]) {
			currentPosition++;
			if(currentPosition >= SEQUENCE.length) {
				currentPosition = 0;
				EventManager.trigger('keySequenceComplete');
			} else {
				timeout = setTimeout(function() {
					currentPosition = 0;
					timeout = null;
				}, TIME_WINDOW);
			}
		} else {
			currentPosition = 0;
		}
	}

	var KeySequencer = {
		init: function() {
			window.onkeydown = checkSequence;
			currentPosition = 0;
		}
	};

	return KeySequencer;
});