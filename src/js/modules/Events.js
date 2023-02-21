import { getEventTarget } from './Helpers';
import initHandler from './initHandler';
import PathResolver from './PathResolver';

const Events = {};

let handlers = {};


initHandler.onInit(function() {
	document.addEventListener('input', (e) => 		Events.trigger(e.type, e) );
	document.addEventListener('keyup', (e) => 		Events.trigger(e.type, e), true );
	document.addEventListener('contextmenu', (e) =>Events.trigger(e.type, e) );
	document.addEventListener('mousedown', (e) => 	Events.trigger(e.type, e) );
	document.addEventListener('dblclick', (e) => 	Events.trigger(e.type, e) );
	document.addEventListener('click', (e) => 		Events.trigger(e.type, e) );
	document.addEventListener('focus', (e) =>		Events.trigger(e.type, e), true);
	document.addEventListener('blur', (e) =>		Events.trigger(e.type, e), true);
	document.addEventListener('change', (e) => 		Events.trigger(e.type, e), true);
	document.addEventListener('keydown', (e) => 	Events.trigger(e.type, e), true);

	window.addEventListener('message', function(msg) {
		if(msg.data.action && msg.data.action === 'terafmEventCatcher') {
			msg = msg.data.terafmEvent;
			const eventTarget = getEventTarget(msg);
			let target = PathResolver(eventTarget);

			if(target) {
				msg.path[0] = target;
				Events.trigger(msg.type, msg);
			}
		}
	})
});


Events.trigger = function(type, event) {
	if(type in handlers) {
		for(let h =0; h < handlers[type].length; ++h) {
			handlers[type][h](event);
		}
	}
}


Events.on = function(type, callback) {
	if(Array.isArray(type)) {
		for(let evt of type) {
			attachListener(evt, callback);
		}
	} else {
		attachListener(type, callback);
	}
}

function attachListener(type, callback) {
	if(!Array.isArray(handlers[type])) handlers[type] = [];
	handlers[type].push(callback);
}

export default Events;
