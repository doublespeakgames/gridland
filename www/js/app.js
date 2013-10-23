requirejs.config({
	baseUrl: "js/lib",
	shim: {
		"google-analytics": {
			exports: "ga"
		}
	},
	paths: {
		app: "../app",
		"jquery": [
			"http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min",
			"jquery-2.0.3.min"
		],
		"google-analytics": [
	        "http://www.google-analytics.com/analytics",
	        "analytics"
        ]
	}
});

// Load the main module to start the game
requirejs(["app/main"]);