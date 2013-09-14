require(["jquery", "app/engine", "app/gameboard", "app/world", 'app/gamestate'], 
		function($, Engine, GameBoard, World, GameState) {
	
	// Initialize the board
	GameState.create();
	Engine.init();
	GameBoard.init();
	World.init();
	GameBoard.fill();
	World.launchDude();
	
//	$('#test').click(function() { require(['app/gameboard'], function(G) {
//		console.log("Moves available? " + G.areMovesAvailable());
//	}); });
	
	$('#test').click(function() { require(['app/world'], function(W) {
		W.phaseTransition();
	}); });
	
	$('.menuBtn').click(function() {
		require(['jquery'], function($) {
			$('.menuBar').toggleClass('open');
		});
	});
});