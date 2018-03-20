window.terafm = window.terafm || {};
terafm.DOMEvents = {};

(function(DOMEvents, ui, initHandler) {
	'use strict';

	let handlers = {},
		shadowRootNode;

	DOMEvents.trigger = function(type, event) {
		// console.log(type, event)
		// Loop through handlers and call
		if(type in handlers) {
			for(let h =0; h < handlers[type].length; ++h) {
				handlers[type][h](event);
			}
		}
	}


	DOMEvents.registerHandler = function(type, callback) {
		if(!Array.isArray(handlers[type])) handlers[type] = [];

		handlers[type].push(callback);
	}


	console.log(handlers);
	

	initHandler.onInit(function() {
		document.addEventListener('input', (e) => 		DOMEvents.trigger(e.type, e) );
		document.addEventListener('keyup', (e) => 		DOMEvents.trigger(e.type, e), true );
		document.addEventListener('contextmenu', (e) => DOMEvents.trigger(e.type, e) );
		document.addEventListener('mousedown', (e) => 	DOMEvents.trigger(e.type, e) );
		document.addEventListener('dblclick', (e) => 	DOMEvents.trigger(e.type, e) );
		document.addEventListener('click', (e) => 		DOMEvents.trigger(e.type, e) );
		document.addEventListener('focus', (e) =>		DOMEvents.trigger(e.type, e), true);
		document.addEventListener('blur', (e) =>		DOMEvents.trigger(e.type, e), true);
		document.addEventListener('change', (e) => 		DOMEvents.trigger(e.type, e), true);
		document.addEventListener('keydown', (e) => 	DOMEvents.trigger(e.type, e), true);
	})

})(terafm.DOMEvents, terafm.ui, terafm.initHandler);