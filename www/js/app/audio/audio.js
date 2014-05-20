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
		Match: {
			file: 'match-test'
		},
		Blunt: {
			file: 'blunt'
		},
		Slash: {
			file: 'slash'
		},
		BlockUp: {
			file: 'blockup'
		},
		BlockDown: {
			file: 'blockdown'
		},
		Die: {
			file: 'die'
		},
		Shoot: {
			file: 'shoot'
		},
		Open: {
			file: 'open'
		},
		Heal: {
			file: 'heal'
		},
		Bomb: {
			file: 'bomb'
		},
		Equip: {
			file: 'equip'
		},
		Teleport: {
			file: 'teleport'
		},
		TileExplode: {
			file: 'tilexplode'
		},
		Wing: {
			file: 'wing'
		},
		Haste: {
			file: 'haste'
		},
		RefreshBoard: {
			file: 'reset'
		},
		PhaseChange: {
			file: 'phasechange'
		},
		FreezeTime: {
			file: 'freeze'
		},
		LevelUp: {
			file: 'levelup'
		},
		DragonLand: {
			file: 'land'
		},
		DragonRoar: {
			file: 'roar'
		},
		ShootFire: {
			file: 'dshoot'
		},
		ExplodeFire: {
			file: 'fireexplode'
		},
		Charge: {
			file: 'charge'
		},
		Ice: {
			file: 'ice'
		},
		Fire: {
			file: 'fire'
		},
		SegmentExplode: {
			file: 'dexplode'
		},
		DragonExplode: {
			file: 'dannihilate'
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
	
	function getLootSound(loot) {
		switch(loot) {
		case 'healthPotion':
			return 'Heal';
		case 'bomb':
			return 'Bomb';
		case 'equipment':
			return 'Equip';
		}
	}
		
	function playLootSound(loot) {
		GameAudio.play(getLootSound(loot));
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
			E.bind('tilesCleared', GameAudio.play.bind(this, 'Match'));
			E.bind('bluntHit', GameAudio.play.bind(this, 'Blunt'));
			E.bind('sharpHit', GameAudio.play.bind(this, 'Slash'));
			E.bind('blockDown', GameAudio.play.bind(this, 'BlockDown'));
			E.bind('blockUp', GameAudio.play.bind(this, 'BlockUp'));
			E.bind('death', GameAudio.play.bind(this, 'Die'));
			E.bind('shoot', GameAudio.play.bind(this, 'Shoot'));
			E.bind('pickupLoot', GameAudio.play.bind(this, 'Open'));
			E.bind('prioritize', GameAudio.play.bind(this, 'BlockUp'));
			E.bind('deprioritize', GameAudio.play.bind(this, 'BlockDown'));
			E.bind('teleport', GameAudio.play.bind(this, 'Teleport'));
			E.bind('lootUsed', playLootSound);
			E.bind('tileExplode', GameAudio.play.bind(this, 'TileExplode'));
			E.bind('flap', GameAudio.play.bind(this, 'Wing'));
			E.bind('haste', GameAudio.play.bind(this, 'Haste'));
			E.bind('refreshBoardSpell', GameAudio.play.bind(this, 'RefreshBoard'));
			E.bind('phaseChangeSpell', GameAudio.play.bind(this, 'PhaseChange'));
			E.bind('freezeTime', GameAudio.play.bind(this, 'FreezeTime'));
			E.bind('levelUp', GameAudio.play.bind(this, 'LevelUp'));
			E.bind('landDragon', GameAudio.play.bind(this, 'DragonLand'));
			E.bind('roar', GameAudio.play.bind(this, 'DragonRoar'));
			E.bind('shootFire', GameAudio.play.bind(this, 'ShootFire'));
			E.bind('explodeFire', GameAudio.play.bind(this, 'ExplodeFire'));
			E.bind('charge', GameAudio.play.bind(this, 'Charge'));
			E.bind('ice', GameAudio.play.bind(this, 'Ice'));
			E.bind('burn', GameAudio.play.bind(this, 'Fire'));
			E.bind('segmentExplode', GameAudio.play.bind(this, 'SegmentExplode'));
			E.bind('dragonExplode', GameAudio.play.bind(this, 'DragonExplode'));

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