require(["jquery", "app/engine", "app/gameboard", "app/world", "app/entity/tile"], 
		function($, Engine, GameBoard, World, Tile) {
	
	// Initialize the board
	Engine.init();
	GameBoard.init();
	World.init();
	GameBoard.fill();
	World.launchDude();
});