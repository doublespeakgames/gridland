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
			music: true,
			silentIf: function() {
				return require('app/engine').isNight();
			},
			required: true
		},
		NightMusic: {
			file: 'theme-night',
			music: true,
			silentIf: function() {
				return !require('app/engine').isNight();
			}
		},
		Click: {
			file: 'click'
		},
		TileClick: {
			file: 'tileclick'
		},
		/* ARRRGG! I HATE THESE MATCH SOUNDS!!! AAAAAAARGH!
		Match1: {
			file: 'match1'
		},
		Match2: {
			file: 'match2'
		},
		Match3: {
			file: 'match3'
		},
		Match4: {
			file: 'match4'
		},
		Match5: {
			file: 'match5'
		}, */
		Hammer: {
			file: 'hammer'
		},
		BlockUp: {
			file: 'blockup'
		},
		BlockDown: {
			file: 'blockdown'
		}
	};
	
	function loadSound(sound) {
		if(format != null) {
			toLoad++;
			provider.load(sound, format, loadCallback);
		}
	}
	
	function loadCallback(file, failed) {
		if(failed) {
			console.log("Loading sound " + file + " failed.");
		}
		toLoad--;
	}
	
	function chooseFormat() {
		var a = new Audio();
		if (!!(a.canPlayType && a.canPlayType('audio/ogg;').replace(/no/, ''))) {
			return "ogg";
		}
		if (!!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''))) {
			return "mp3";
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
	
	function matchSound(r, s, restart) {
		matchNum = restart ? 1 : matchNum + 1;
		matchNum = matchNum > 5 ? 5 : matchNum;
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
			
			E.bind('tileDrop', GameAudio.play.bind(this, 'TileClick'));
			E.bind('setMusicVolume', GameAudio.setMusicVolume);
			E.bind('setEffectsVolume', GameAudio.setEffectsVolume);
			E.bind('phaseChange', changeMusic);
			E.bind('tilesCleared', matchSound);
			E.bind('hammer', GameAudio.play.bind(this, 'Hammer'));
			E.bind('blockDown', GameAudio.play.bind(this, 'BlockDown'));
			E.bind('blockUp', GameAudio.play.bind(this, 'BlockUp'));

			GameAudio.setMusicVolume(require('app/gameoptions').get('musicVolume'));
			GameAudio.setEffectsVolume(require('app/gameoptions').get('effectsVolume'));
		},
		
		isReady: function() {
			return toLoad <= 0;
		},
		
		setMusicVolume: function(volume) {
			require('app/gameoptions').set('musicVolume', volume);
			provider.setMusicVolume(volume);
		},
		
		setEffectsVolume: function(volume) {
			require('app/gameoptions').set('effectsVolume', volume);
			provider.setEffectsVolume(volume);
		},
		
		play: function(sound, silent) {
			var s = sounds[sound];
			if(s) {
				provider.play(s, silent);
			}
		},
		
		stop: function(sound) {
			var s = sounds[sound];
			if(s) {
				provider.stop(sounds[sound]);
			}
		}
	};
	
	return GameAudio;
});