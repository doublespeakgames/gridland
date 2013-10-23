({
	appDir: "../www",
	baseUrl: "js/lib",
	dir: "../build",
	mainConfigFile: "../www/js/app.js",
	modules: [ 
		{
			name: "app"
		}
	],
	paths: {
		'jquery': 'empty:',
		'google-analytics': 'empty:'
	},
	optimize: 'uglify',
	optimizeCss: 'standard',
	removeCombined: true
})