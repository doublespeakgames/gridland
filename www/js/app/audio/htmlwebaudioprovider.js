define(function() {
	
	var context = null;
	var musicVolume = null;
	var effectsVolume = null;
	var timeout = 30000;
	
	function createSoundSource(sound) {
		var source;
		var htmlSource;
		if(sound.music) {
			htmlSource = sound.data;
			source = context.createMediaElementSource(htmlSource);
			source.loop = true;
			sound.volume = context.createGain();
			sound.volume.gain.value = 1;
			sound.volume.connect(musicVolume);
			source.connect(sound.volume);
		} else {
			htmlSource = sound.data.cloneNode();
			source = context.createMediaElementSource(htmlSource);
			source.connect(effectsVolume);
		}
		return htmlSource;
	}
	
	var HtmlWebAudioProvider = {
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
			return HtmlWebAudioProvider;
		},
		
		load: function(sound, basePath, format, callback) {
			basePath = basePath || "";	
			sound.data = new Audio(basePath + 'audio/' + sound.file + '.' + format);
			if(sound.music) {
				sound.data.loop = true;
			}
			
			if(sound.music && !sound.required) {
				sound.deferred = true;
				callback(sound.file);
			}
			
			var failed = setTimeout(function() {
            	sound.data = null;
            	callback(sound.file, true);
            }, timeout);
            sound.data.addEventListener('canplaythrough', function() {
            	clearTimeout(failed);
            	if(!sound.deferred) {
            		callback(sound.file);
            	} else {
            		sound.deferred = false;
            		if(sound.playRequested) {
            			HtmlWebAudioProvider.play(sound);
            		}
            	}
            });
		},
		
		play: function(sound) {
			if(sound.data) {
				var source = sound.currentSource = createSoundSource(sound);
				if(sound.silentIf && sound.silentIf() && sound.volume != null) {
					sound.volume.gain.value = 0;
				}
				source.play();
			} else if(sound.deferred) {
				sound.playRequested = true;
			}
		},
		
		stop: function(sound) {
			if(sound.buffer) {
				sound.currentSource.pause();
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
			if(outSound.data && inSound.data) {
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
	return HtmlWebAudioProvider;
});
