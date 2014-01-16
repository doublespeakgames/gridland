define(['app/eventmanager', 'app/audio/webaudioprovider', 'app/audio/htmlaudioprovider'], 
		function(E, WebAudioProvider, HtmlAudioProvider) {
	
	var toLoad = 0;
	var format = null;
	var provider = null;
	var playingMusic = false;
	
	var sounds = {
		DayMusic: {
			file: 'theme-day',
			loop: true
		},
		NightMusic: {
			file: 'theme-night',
			loop: true
		},
		Click: {
			file: 'click'
		}
	};
	
	function loadSound(sound) {
		if(format != null) {
			toLoad++;
			provider.load(sound, format, loadCallback);
		}
	}
	
	function loadCallback() {
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
	
	function getProvider() {
		var p = WebAudioProvider.getInstance();
		if(p == null) {
			p = HtmlAudioProvider.getInstance();
		}
		return p;
	}
	
	function crossFade(outSound, inSound, time) {
		provider.crossFade(sounds[outSound], sounds[inSound], time);
	}
	
	var GameAudio = {
		init: function(options) {
			if(!provider) { 
				provider = getProvider();
				format = chooseFormat();
				if(provider != null && format != null) {
					toLoad = 0;
					for(s in sounds) {
						loadSound(sounds[s]);
					}
					E.bind('dayBreak', function() {
						if(!playingMusic) {
							playingMusic = true;
							GameAudio.play('DayMusic');
							GameAudio.play('NightMusic', true);
						}
					});
				}
			} else {
				crossFade('NightMusic', 'DayMusic', 700);
			}
			
			E.bind('setMusicVolume', function(v) {
				GameAudio.setMusicVolume(v);
			});
			E.bind('phaseChange', function(isNight) {
				if(isNight) {
					crossFade('DayMusic', 'NightMusic', 700);
				} else {
					crossFade('NightMusic', 'DayMusic', 700);
				}
			});
			
			var musicVolume = require('app/gameoptions').get('musicVolume');
			if(musicVolume != null) {
				GameAudio.setMusicVolume(musicVolume);
			}
		},
		
		isReady: function() {
			return toLoad <= 0;
		},
		
		setMusicVolume: function(volume) {
			require('app/gameoptions').set('musicVolume', volume);
			provider.setMusicVolume(volume);
		},
		
		play: function(sound, silent) {
			provider.play(sounds[sound], silent);
		},
		
		stop: function(sound) {
			provider.stop(sounds[sound]);
		}
	};
	
	return GameAudio;
});