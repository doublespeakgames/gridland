requirejs.config({
	baseUrl: "js/lib",
	shim: {
		three: {
			exports: "THREE"
		}
	},
	paths: {
		app: "../app"
	}
});

// Load the main module to start the game
requirejs(["app/main"]);