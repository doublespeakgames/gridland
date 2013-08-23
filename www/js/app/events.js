define(['app/util'], function(Util) {
	
	return {
		/**
		 * Gets a list of listeners for a particular object
		 * Returns an object with keys representing event names,
		 * and values as arrays of bound callbacks
		 */
		getListeners: function(o) {
			if(typeof o._listeners == 'undefined') {
				o._listeners = {};
			}
			return o._listeners;
		},
		
		/**
		 * Gets a list of callback objects for a particular object and event
		 * Returns an array of objects. Each object has 'callback' and 'binder'
		 * attributes
		 */
		getListenersForEvent: function(o, e) {
			if(typeof this.getListeners(o)[e] == 'undefined') {
				this.getListeners(o)[e] = [];
			}
			return this.getListeners(o)[e];
		},
		
		/**
		 * Binds a listener to an event on an object
		 * bindee: The object to which to bind the event
		 * eventName: The name of the event
		 * callback: The function to call
		 * binder: The object that bound the call. Optional.		 
		 */
		bind: function(bindee, eventName, callback, binder) {
			var binderId = binder != null ? Util.getId(binder) : null;
			this.getListenersForEvent(bindee, eventName).push({
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
		unbind: function(bindee, eventName, binder, callback) {
			var listeners = this.getListenersForEvent(bindee, eventName);
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
		 * Triggers an event on an object
		 * o: The object to which the event applies
		 * event: The event name
		 * params: An array of parameters to pass to the callback
		 */
		trigger: function(o, event, params) {
			var list = this.getListenersForEvent(o, event);
			for(var i = 0, len = list.length; i < len; i++) {
				list[i].callback.apply(o, params);
			}
		}
	};
});