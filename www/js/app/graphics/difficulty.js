define(['app/eventmanager', 'app/gameoptions'], function(E, O) {

	var G = null, _el = null;

	function el() {
		if(_el == null) {
			G.addStyleRule('.difficulty:before', 'content:"- ' + G.getText('DIFFICULTY') + ' -";');
			_el = G.make('difficulty submenu').append(G.make('difficultySwitch litBorder'));
			G.addToMenu(_el);
		}
		return _el;
	}

	function toggleSwitch() {
		O.set('casualMode', !O.get('casualMode', false));
		syncSwitch();
		E.trigger('difficultyChanged', [O.get('casualMode', false)]);
	}

	function syncSwitch() {
		el().toggleClass('casual', O.get('casualMode', false));
	}

	return {
		init: function() {
			G = require('app/graphics/graphics');
			if(_el) {
				_el.remove();
			}
			_el = null;
			el().off().on('click touchstart', toggleSwitch)
			syncSwitch();
		}
	}
});