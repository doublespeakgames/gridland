define({
	guid: function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		});
	},
	
	getId: function(o) {
		if(typeof o.__guid == 'undefined') {
			o.__guid = this.guid();
		}
		return o.__guid;
	}
});