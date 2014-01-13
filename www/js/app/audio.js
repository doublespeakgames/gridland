define(function() {
	
	var toLoad = 0;
	var format = null;
	
	var sounds = {
		DayMusic: {
			file: 'theme-day',
			loop: true
		},
		NightMusic: {
			file: 'theme-night',
			loop: true
		}
	};
	
	function loadSound(sound) {
		if(format != null) {
			console.log(sound + ' loading...');
			toLoad++;
			sound.element = new Audio("audio/" + sound.file + "." + format);
			if(sound.loop) {
				sound.element.loop = true;
			}
			sound.element.addEventListener('canplaythrough', loadCallback);
		}
	}
	
	function loadCallback() {
		console.log('loaded');
		toLoad--;
	}
	
	function chooseFormat() {
		var a = new Audio();
		if (!!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''))) {
			return "mp3";
		}
		if (!!(a.canPlayType && a.canPlayType('audio/ogg;').replace(/no/, ''))) {
			return "ogg";
		}
		
		// Shouldn't need more formats
		return null;
	}
	
	return {
		init: function(options) {
			console.log('Audio init');
			format = chooseFormat();
			if(format == null) return; // No sound for you!
			toLoad = 0;
			for(s in sounds) {
				loadSound(sounds[s]);
			}
		},
		
		isReady: function() {
			return toLoad <= 0;
		},
		
		setVolume: function(volume) {
			for(var s in sounds) {
				sounds[s].element.volume = volume;
			}
		},
		
		play: function(sound) {
			sounds[sound].element.play();
		},
		
		pause: function(sound) {
			sounds[sound].element.pause();
		}
	};
});