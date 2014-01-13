define(['app/eventmanager', 'app/gamestate'], function(E, State) {
	
	var xPos = /matrix\(1, 0, 0, 1, ([0-9]+)/;
	
	var _el = null;
	var musicHandle = null;
	function el() {
		var G = require('app/graphics/graphics');
		if(_el == null) {
			musicHandle = G.make('sliderHandle');
			musicHandle.data('controls', 'music');
			_el = G.make('musicVolume volumeSlider').append(G.make('nightSprite'))
				.append(G.make('sliderTrack litBorder')).append(musicHandle);
			G.addToMenu(_el);
		}
		return _el;
	}
	
	function setMusicVolume(v) {
		var totalWidth = musicHandle.parent().find('.sliderTrack').width();
		musicHandle.css('transform', 'translate3d(' + (v * totalWidth) + 'px, 0px, 0px)');
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
			
			if(dragTarget.data('controls') === 'music') {
				E.trigger('setMusicVolume', [volume]);
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
			_el = null;
			el();
			setMusicVolume(1);
			musicHandle.off().on('mousedown touchstart', handleTouchStart);
			el().off().on('mousemove touchmove', handleTouchMove);
			$('.menuBar').off().on('mouseup touchend', handleTouchEnd);
		}
	};
});