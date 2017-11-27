window.terafm = window.terafm || {};
terafm.DOMEvents = {};

(function(DOMEvents) {
	'use strict';


	let handlers = {};

	DOMEvents.trigger = function(type, event) {
		let c = 0;
		if(type in handlers) {
			for(let h =0; h < handlers[type].length; ++h) {
				handlers[type][h](event);
				c++;
			}
		}
		// console.log(type, c + ' handlers', event);
	}


	DOMEvents.registerHandler = function(type, callback) {
		if(!Array.isArray(handlers[type])) handlers[type] = [];

		handlers[type].push(callback);
	}

	

	document.addEventListener('click', (e) => 		DOMEvents.trigger(e.type, e) );
	document.addEventListener('mousedown', (e) => 	DOMEvents.trigger(e.type, e) );
	document.addEventListener('focus', (e) =>		DOMEvents.trigger(e.type, e) , true);
	document.addEventListener('blur', (e) =>		DOMEvents.trigger(e.type, e) , true);
	document.addEventListener('input', (e) => 		DOMEvents.trigger(e.type, e) );
	document.addEventListener('keyup', (e) => 		DOMEvents.trigger(e.type, e) ); // Todo: Needed?
	document.addEventListener('contextmenu', (e) => DOMEvents.trigger(e.type, e) );
	document.addEventListener('change', (e) => 		DOMEvents.trigger(e.type, e) , true);

})(terafm.DOMEvents);