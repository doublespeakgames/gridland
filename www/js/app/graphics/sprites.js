define(function() {
	
	var spriteoffsets = {
		blacksmith: 0,
		bricklayer: 640,
		bucklericon: 960,
		buttonicons: 1020,
		demon: 1048,
		dragon: 1650,
		dragoneffects: 3290,
		dragonhead: 3378,
		dragonneck: 3438,
		dude: 3486,
		dudenight: 3806,
		earthelemental: 4222,
		fireelemental: 4770,
		fireball: 5057,
		gem: 5064,
		harmour: 5160,
		heart: 5503,
		imp: 5559,
		items: 5979,
		lich: 6007,
		lizardman: 6547,
		menu: 6806,
		music: 6886,
		rat: 7142,
		sawmill: 7233,
		shack: 7933,
		skeleton: 8253,
		social: 8477,
		spells: 8573,
		spider: 8653,
		star: 8919,
		sun: 8935,
		swordicon: 8995,
		tilesday: 9055,
		tilesnight: 9523,
		tower: 10043,
		treasurechest: 10443,
		warlock: 10495,
		waterelemental: 10754,
		weaver: 11027,
		zombie: 11347
	};
	
	return {
		getOffset: function(spriteName) {
			return spriteoffsets[spriteName] || 0;
		}
	};
});