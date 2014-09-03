define(['app/util'], function(Util) {
	
	var listeners = {};
	
	return {
		
		init: function() {
			listeners = {};
		},
		
		/**
		 * Gets a list of listeners for a particular event
		 * Returns an array of listener callbacks,
		 */
		getListeners: function(eventName) {
			var list = listeners[eventName];
			if(list == null) {
				list = listeners[eventName] = [];
			}
			
			return list;
		},
		
		/**
		 * Binds a listener to an event
		 * eventName: The name of the event
		 * callback: The function to call
		 * binder: The object that bound the call. Optional.		 
		 */
		bind: function(eventName, callback, binder) {
			var binderId = binder != null ? Util.getId(binder) : null;
			this.getListeners(eventName).push({
				callback: callback,
				binderId: binderId
			});
		},
		
		/** 
		 * Unbinds listeners from an object
		 * bindee: The object from which to unbind
		 * eventName: The name of the event
		 * binder: The object that bound the call (optional)
		 * callback: The exact function to callback function to remove (optional)
		 */
		unbind: function(eventName, binder, callback) {
			var listeners = this.getListeners(eventName);
			if(binder != null || callback != null) {
				// Clear only the listener that fits the parameters
				for(var i = 0, len = listeners.length; i < len; i++) {
					var listener = listeners[i];
					if((binder == null || listener.binderId == Util.getId(binder)) &&
							(callback == null || callback == listener.callback)) {
						listeners.splice(i, 1);
						return;
					}
				}
			} else {
				// Clear all listeners from the event
				listeners.length = 0;
			}
		},
		
		/**
		 * Triggers an event
		 * event: The event name
		 * params: An array of parameters to pass to the callback
		 */
		trigger: function(event, params) {
			var list = this.getListeners(event);
			for(var i = 0, len = list.length; i < len; i++) {
				list[i].callback.apply(window, params);
			}
		}
	};
});