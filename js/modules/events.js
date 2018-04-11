window.terafm = window.terafm || {};
terafm.Events = {};

(function(Events, ui, initHandler) {
	'use strict';

	let handlers = {},
		shadowRootNode;

	Events.trigger = function(type, event) {
		// console.log(type, event)
		// Loop through handlers and call
		if(type in handlers) {
			for(let h =0; h < handlers[type].length; ++h) {
				handlers[type][h](event);
			}
		}
	}


	Events.on = function(type, callback) {
		if(!Array.isArray(handlers[type])) handlers[type] = [];

		handlers[type].push(callback);
	}


	initHandler.onInit(function() {
		document.addEventListener('input', (e) => 		Events.trigger(e.type, e) );
		document.addEventListener('keyup', (e) => 		Events.trigger(e.type, e), true );
		document.addEventListener('contextmenu', (e) => Events.trigger(e.type, e) );
		document.addEventListener('mousedown', (e) => 	Events.trigger(e.type, e) );
		document.addEventListener('dblclick', (e) => 	Events.trigger(e.type, e) );
		document.addEventListener('click', (e) => 		Events.trigger(e.type, e) );
		document.addEventListener('focus', (e) =>		Events.trigger(e.type, e), true);
		document.addEventListener('blur', (e) =>		Events.trigger(e.type, e), true);
		document.addEventListener('change', (e) => 		Events.trigger(e.type, e), true);
		document.addEventListener('keydown', (e) => 	Events.trigger(e.type, e), true);
	})

})(terafm.Events, terafm.ui, terafm.initHandler);