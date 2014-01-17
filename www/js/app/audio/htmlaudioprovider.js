define(function() {
	
	var musicElements = [];
	var effectsElements = [];
	var musicVolume = 1;
	
	var HtmlAudioProvider = {
			getInstance: function() {
				return HtmlAudioProvider;
			},
			
			load: function(sound, format, callback) {
				sound.data = new Audio("audio/" + sound.file + "." + format);
                if(sound.loop) {
                	sound.data.loop = true;
                	musicElements.push(sound);
                } else {
                	effectsElements.push(sound);
                }
                sound.data.addEventListener('canplaythrough', callback);
			},
			
			play: function(sound, silent) {
				if(silent) {
					sound.data.fadedOut = true;
					sound.data.volume = 0;
				}
//				var s = sound.data.cloneNode();
//				s.volume = sound.data.volume;
//				s.fadedOut = sound.data.fadedOut;
//				sound.data = s;
				sound.data.play();
			},
			
			stop: function(sound) {
				sound.data.pause();
			},
			
			setMusicVolume: function(v) {
				musicVolume = v;
				musicElements.forEach(function(a) {
					if(a.data.fadedOut) {
						a.data.volume = 0;
					} else {
						a.data.volume = v;
					}
				});
			},
			
			setEffectsVolume: function(v) {
				effectsElements.forEach(function(a) {
					a.data.volume = v;
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