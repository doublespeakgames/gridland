require(["jquery", "app/engine", "app/gameboard", "app/world"], 
		function($, Engine, GameBoard, World) {
	
	// Initialize the board
	GameBoard.init();
	World.init();
	
	World.launchDude();
	
	// Run the game
//	(function gameloop(){
//		window.setTimeout(gameloop, 200);
//		
//	})();
});