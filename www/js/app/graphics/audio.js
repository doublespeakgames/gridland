define(['app/eventmanager', 'app/gamestate'], function(E, State) {
	
	var xPos = /matrix\(1, 0, 0, 1, ([0-9]+)/;
	var G = null;
	
	var _el = null;
	var musicHandle = null;
	var effectsHandle = null;
	function el() {
		if(_el == null) {
			_el = G.make('volumeControls');
			var musicSlider = makeSlider('music');
			var effectsSlider = makeSlider('effects');
			musicHandle = musicSlider.handle;
			effectsHandle = effectsSlider.handle;
			_el.append(musicSlider).append(effectsSlider);
			G.addToMenu(_el);
		}
		return _el;
	}
	
	function makeSlider(type) {
		var slider = G.make(type + 'Volume volumeSlider').append(G.make('nightSprite'))
			.append(G.make('sliderTrack litBorder'));
		slider.handle = G.make('sliderHandle').data('controls', type).appendTo(slider);
		return slider;
	}
	
	function setMusicVolume(v) {
		var totalWidth = musicHandle.parent().find('.sliderTrack').width();
		musicHandle.css('transform', 'translate3d(' + (v * totalWidth) + 'px, 0px, 0px)');
	}
	
	function setEffectsVolume(v) {
		var totalWidth = effectsHandle.parent().find('.sliderTrack').width();
		effectsHandle.css('transform', 'translate3d(' + (v * totalWidth) + 'px, 0px, 0px)');
	}
	
	var dragTarget = null;
	function handleTouchStart(e) {
		// Handle wacky touch event objects
		if(e.originalEvent.changedTouches) {
			e = e.originalEvent.changedTouches[0];
		}
		dragTarget = $(e.target);
	}
	
	function handleTouchEnd(e) {
		// Handle wacky touch event objects
		if(e.originalEvent.changedTouches) {
			e = e.originalEvent.changedTouches[0];
		}
		if(dragTarget != null) {
			if(dragTarget._cachedOffsetX == null) {
				dragTarget._cachedOffsetX = dragTarget.parent().find('.sliderTrack').offset().left;
				dragTarget._cachedOffsetWidth = dragTarget.parent().find('.sliderTrack').width();
			}
			var volume = parseFloat(xPos.exec(dragTarget.css('transform'))[1]) / dragTarget._cachedOffsetWidth;

			switch(dragTarget.data('controls')) {
			case 'music':
				E.trigger('setMusicVolume', [volume]);
				break;
			case 'effects':
				E.trigger('setEffectsVolume', [volume]);
			}
		}
		dragTarget = null;
	}
	
	function handleTouchMove(e) {
		// Handle wacky touch event objects
		if(e.originalEvent.changedTouches) {
			e = e.originalEvent.changedTouches[0];
		}
		if(dragTarget != null) {
			if(dragTarget._cachedOffsetX == null) {
				dragTarget._cachedOffsetX = dragTarget.parent().find('.sliderTrack').offset().left;
				dragTarget._cachedOffsetWidth = dragTarget.parent().find('.sliderTrack').width();
			}
			var pos = e.pageX - dragTarget._cachedOffsetX;
			if(pos < 0) {
				pos = 0;
			} else if(pos > dragTarget._cachedOffsetWidth) {
				pos = dragTarget._cachedOffsetWidth;
			}
			dragTarget.css('transform', 'translate3d(' + (pos) + 'px, 0px, 0px)');
		}
	}
	
	return {
		init: function() {
			G = require('app/graphics/graphics');
			if(_el) {
				_el.remove();
			}
			_el = null;
			el();
			setMusicVolume(require('app/gameoptions').get('musicVolume'));
			musicHandle.off().on('mousedown touchstart', handleTouchStart);
			setEffectsVolume(require('app/gameoptions').get('effectsVolume'));
			effectsHandle.off().on('mousedown touchstart', handleTouchStart);
			el().off().on('mousemove touchmove', handleTouchMove);
			G.get('.menuBar').off().on('mouseup touchend', handleTouchEnd);
		}
	};
});