require(["jquery", "app/engine"], 
		function($, Engine) {
	
	// use requestAnimationFrame when available
	var anim = (function(){
		return	window.requestAnimationFrame		||
				window.webkitRequestAnimationFrame	||
				window.mozRequestAnimationFrame		||
				function( callback ){
					window.setTimeout(callback, 1000 / 60);
				};
	})();
	
	// Run the game
	(function gameloop(){
		anim(gameloop);
		/// Todo
	})();
});