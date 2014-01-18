define(function() {
	
	var context = null;
	var musicVolume = null;
	var effectsVolume = null;
	
	function createSoundSource(sound) {
		var source = context.createBufferSource();
		source.buffer = sound.buffer;
		if(sound.loop) {
			source.loop = true;
			sound.volume = context.createGain();
			sound.volume.gain.value = 1;
			sound.volume.connect(musicVolume);
			source.connect(sound.volume);
		} else {
			source.connect(effectsVolume);
		}
		return source;
	}
	
	var WebAudioProvider = {
		getInstance: function() {
			if(typeof AudioContext !== 'undefined') {
				context = new AudioContext();
			} else if(typeof webkitAudioContext !== 'undefined') {
				context = new webkitAudioContext();
			} else {
				return null;
			}
			
			musicVolume = context.createGain();
			musicVolume.connect(context.destination);
			effectsVolume = context.createGain();
			effectsVolume.connect(context.destination);
			return WebAudioProvider;
		},
		
		load: function(sound, format, callback) {
			var request = new XMLHttpRequest();
			request.open("GET", "audio/" + sound.file + "." + format, true);
			request.responseType = "arraybuffer";
			
			request.onload = function() {
				context.decodeAudioData(request.response, function(buffer) {
					sound.buffer = buffer;
					if(typeof callback === 'function') {
						callback(sound.file);
					}
				}, function() {
					callback(sound.file, true);
				});
			};
			request.send();
		},
		
		play: function(sound, silent) {
			if(sound.buffer) {
				var source = sound.currentSource = createSoundSource(sound);
				if(silent && sound.volume != null) {
					sound.volume.gain.value = 0;
				}
				source.start(0);
			}
		},
		
		stop: function(sound) {
			if(sound.buffer) {
				sound.currentSource.stop(0);
			}
		},
		
		setMusicVolume: function(v) {
			if(musicVolume) {
				musicVolume.gain.value = v;
			}
		},
		
		setEffectsVolume: function(v) {
			if(effectsVolume) {
				effectsVolume.gain.value = v;
			}
		},
		
		crossFade: function(outSound, inSound, time) {
			if(outSound.buffer && inSound.buffer) {
				(function fade() {
					outSound.volume.gain.value -= 0.1;
					outSound.volume.gain.value = outSound.volume.gain.value < 0 ? 0 : outSound.volume.gain.value;
					inSound.volume.gain.value += 0.1;
					inSound.volume.gain.value = inSound.volume.gain.value > 1 ? 1 : inSound.volume.gain.value;
					if(outSound.volume.gain.value > 0) {
						setTimeout(fade, time / 10);
					}
				})();
			}
		}
	};
	return WebAudioProvider;
});