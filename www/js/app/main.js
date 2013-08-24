require(["jquery", "app/engine", "app/gameboard", "app/world"], 
		function($, Engine, GameBoard, World) {
	
	// Initialize the board
	GameBoard.init();
	World.init();
	
	setTimeout(function() {
		require(['app/world'], function(World) {
			World.launchDude();
		});
	}, 5000);
	
	// Run the game
//	(function gameloop(){
//		window.setTimeout(gameloop, 200);
//		
//	})();
});