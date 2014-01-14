define(function() {
	
	var audioElements = [];
	var musicVolume = 1;
	
	var HtmlAudioProvider = {
			getInstance: function() {
				return HtmlAudioProvider;
			},
			
			load: function(sound, format, callback) {
				sound.data = new Audio("audio/" + sound.file + "." + format);
				audioElements.push(sound.data);
                if(sound.loop) {
                	sound.data.loop = true;
                }
                sound.data.addEventListener('canplaythrough', callback);
			},
			
			play: function(sound, silent) {
				if(silent) {
					sound.data.fadedOut = true;
					sound.data.volume = 0;
				}
				sound.data.play();
			},
			
			stop: function(sound) {
				sound.data.pause();
			},
			
			setMusicVolume: function(v) {
				musicVolume = v;
				audioElements.forEach(function(a) {
					if(a.fadedOut) {
						a.volume = 0;
					} else {
						a.volume = v;
					}
				});
			},
			
			crossFade: function(outSound, inSound, time) {
				outSound.data.fadedOut = true;
				inSound.data.fadedOut = false;
				var step = musicVolume / 10;
				(function fade() {
					var outVal = outSound.data.volume - step;
					outVal = outVal < 0 ? 0 : outVal;
					outSound.data.volume = outVal;
					var inVal = inSound.data.volume + step;
					inVal = inVal > 1 ? 1 : inVal;
					inSound.data.volume  = inVal;
					
					if(outVal > 0) {
						setTimeout(fade, time / 10);
					}
				})();
			}
	};
	return HtmlAudioProvider;
});