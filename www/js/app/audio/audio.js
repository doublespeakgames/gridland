define(['app/eventmanager', 'app/audio/webaudioprovider', 'app/audio/htmlaudioprovider'], 
		function(E, WebAudioProvider, HtmlAudioProvider) {
	
	var toLoad = 0;
	var format = null;
	var provider = null;
	var playingMusic = false;
	var matchNum = 1;
	
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
		},
		TileClick: {
			file: 'tileclick'
		},
		Match1: {
			file: 'match1'
		},
		Match2: {
			file: 'match2'
		},
		Match3: {
			file: 'match3'
		}
//		,
//		Match4: {
//			file: 'match4'
//		}
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
	
	function setMusicVolume(v) {
		GameAudio.setMusicVolume(v);
	}
	
	function startMusic() {
		if(!playingMusic) {
			playingMusic = true;
			GameAudio.play('DayMusic');
			GameAudio.play('NightMusic', true);
		}
	}
	
	function changeMusic(isNight) {
		if(isNight) {
			crossFade('DayMusic', 'NightMusic', 700);
		} else {
			crossFade('NightMusic', 'DayMusic', 700);
		}
	}
	
	function tileSound() {
		GameAudio.play('TileClick');
	}
	
	function matchSound(r, s, restart) {
		matchNum = restart ? 1 : matchNum + 1;
		matchNum = matchNum > 3 ? 3 : matchNum;
		GameAudio.play('Match' + matchNum);
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
					E.bind('dayBreak', startMusic);
				}
			} else {
				crossFade('NightMusic', 'DayMusic', 700);
			}
			
			E.bind('tileDrop', tileSound);
			E.bind('setMusicVolume', setMusicVolume);
			E.bind('phaseChange', changeMusic);
			E.bind('tilesCleared', matchSound);
			
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