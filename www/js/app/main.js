require(["jquery", "app/engine", "app/gameboard", "app/world", "app/entity/tile"], 
		function($, Engine, GameBoard, World, Tile) {
	
	// Initialize the board
	GameBoard.init();
	World.init();
	
	GameBoard.fill();
	World.launchDude();
	
	// Run the game
//	(function gameloop(){
//		window.setTimeout(gameloop, 200);
//		
//	})();
});