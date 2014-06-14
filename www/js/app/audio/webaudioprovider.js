define(function() {
	
	var context = null;
	var musicVolume = null;
	var effectsVolume = null;
	
	function createSoundSource(sound, partNum) {
		var source = context.createBufferSource();
		if(sound.partsBuffer) {
			sound.playingPart = partNum;
			source.buffer = sound.partsBuffer[sound.playingPart];
			if(partNum < sound.parts - 1) {
				// Play the next part
				source.onended = function() {
					WebAudioProvider.play(sound, partNum + 1);
				};
			} else {
				if(sound.music) {
					// Loop
					source.onended = function() {
						WebAudioProvider.play(sound, 0);
					};
				}
			}
		} else {
			source.buffer = sound.buffer;
		}
		if(sound.music) {
			if(!sound.partsBuffer) {
				source.loop = true;
			}
			sound.volume = context.createGain();
			sound.volume.gain.value = 1;
			sound.volume.connect(musicVolume);
			source.connect(sound.volume);
		} else {
			source.connect(effectsVolume);
		}
		return source;
	}
	
	function isSoundReady(sound) {
		return (sound.parts && sound.partsBuffer && sound.partsBuffer[0]) || sound.buffer;
	}
	
	function soundLoaded(sound, callback) {
		if(!sound.deferred) {
			callback(sound.file);
		} else if(sound.deferred) {
			sound.deferred = false;
			if(sound.playRequested) {
				WebAudioProvider.play(sound);
			}
		}
	}
	
	function loadSound(sound, format, callback, partNum) {
		var request = new XMLHttpRequest();
		var isPart = partNum != null;
		if(isPart) {
			sound.partsBuffer = [];
		}
		request.open("GET", "audio/" + sound.file + (isPart ? "-" + partNum : "") + "." + format, true);
		request.responseType = "arraybuffer";
		request.onload = function() {
			if(sound.music && !sound.required) {
				sound.deferred = true;
				callback(sound.file);
			}
			context.decodeAudioData(request.response, function(buffer) {
				if(isPart) {
					sound.partsBuffer[partNum] = buffer;
					if(partNum == 0) {
						soundLoaded(sound, callback);
					}
				} else {
					sound.buffer = buffer;
					soundLoaded(sound, callback);
				}
			});
		};
		request.send();
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
			
			if(sound.parts != null) {
				for(var i = 0; i < sound.parts; i++) {
					loadSound(sound, format, callback, i);
				}
			} else {
				loadSound(sound, format, callback);
			}
		},
		
		play: function(sound, partNum) {
			partNum = partNum || 0;
			if(isSoundReady(sound)) {
				var source = sound.currentSource = createSoundSource(sound, partNum);
				if(sound.silentIf && sound.silentIf() && sound.volume != null) {
					sound.volume.gain.value = 0;
				}
				source.start(0);
			} else if(sound.deferred) {
				sound.playRequested = true;
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