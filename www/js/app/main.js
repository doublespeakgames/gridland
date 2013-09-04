require(["jquery", "app/engine", "app/gameboard", "app/world", "app/entity/tile"], 
		function($, Engine, GameBoard, World, Tile) {
	
	// Initialize the board
	Engine.init();
	GameBoard.init();
	World.init();
	GameBoard.fill();
	World.launchDude();
	
	// Dev stuff. Remove being release.
	setTimeout(function() {
		require(["app/world"], function(World) {
			World.launchCity();
		});
	}, 1000);
	$('#test').click(function() { require(['app/gameboard'], function(G) {
		console.log("Moves available? " + G.areMovesAvailable());
	}); });
});