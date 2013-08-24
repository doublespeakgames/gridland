require(["jquery", "app/engine", "app/gameboard", "app/world"], 
		function($, Engine, GameBoard, World) {
	
	// use requestAnimationFrame when available
	var anim = (function(){
		return	window.requestAnimationFrame		||
				window.webkitRequestAnimationFrame	||
				window.mozRequestAnimationFrame		||
				function( callback ){
					window.setTimeout(callback, 1000 / 60);
				};
	})();
	
	// Initialize the board
	$('body').append(GameBoard.init());
	$(GameBoard.el.append(World.init()));
	
	// Run the game
	(function gameloop(){
		anim(gameloop);
		/// Todo
	})();
});