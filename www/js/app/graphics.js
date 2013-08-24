define(['jquery'], function($) {
	return {
		
		init: function() {
			// Nuthin for now
		},
		
		createBoard: function(rows, cols) {
			// Generate the board element
			var el = $('<div>').addClass('gameBoard');
			// Determine the board dimensions based on the size of the gems
			var testGem = $('<div>').addClass('gem').hide().appendTo('body');
			el.width(testGem.width() * cols);
			el.height(testGem.height() * rows);
			testGem.remove();
			return el;
		},
		
		newElement: function(className) {
			return $('<div>').addClass(className);
		},
		
		addToWorld: function(entity) {
			$('.world').append(entity.el());
		},
		
		addToScreen: function(entity) {
			$('body').append(entity.el());
		},
		
		addToBoard: function(entity) {
			$('.gameBoard').append(entity.el());
		},
		
		updateSprite: function(entity) {
			var el = entity.el();
			var spriteRow = entity.tempAnimation == null ? entity.animation : entity.tempAnimation;
			el.css('background-position', -(entity.frame * el.width()) + "px " + -(spriteRow * el.height()) + 'px');
		},
		
		setPosition: function(entity, pos) {
			var el = entity.el();
			el.css('left', (pos - (el.width() / 2)) + "px");
		}
	};
});