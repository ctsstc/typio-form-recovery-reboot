import Cache from '../../modules/Cache';
import PathGenerator from '../../modules/PathGenerator';

// Run only in child frames
if(document !== window.top.document) {

	const events = [
		{ name: 'input' },
		{ name: 'keyup', capture: true },
		{ name: 'contextmenu' },
		{ name: 'mousedown' },
		{ name: 'click' },
		{ name: 'dblclick' },
		{ name: 'focus', capture: true },
		{ name: 'blur', capture: true },
		{ name: 'change', capture: true },
		{ name: 'keydown', capture: true },
	];

	function eventHandler(e) {
		let msg = {
			action: 'terafmEventCatcher',
			event: {
				path: [Cache.cache(e.path[0], () => PathGenerator(e.path[0]))],
				type: e.type
			}
		}
	
		// Special case for to send mouse coordinates
		if(e.type === 'contextmenu') {
			msg.event.pageX = e.pageX;
			msg.event.pageY = e.pageY;
		} else if(e.type === 'keydown') {
			msg.event.key = e.key;
		} else if(e.type === 'keyup') {
			msg.event.keyCode = e.keyCode;
		}
	
		// console.log(msg);
		window.top.postMessage(msg, '*');
	}

	function attachListeners() {
		for(const event of events) {
			document.addEventListener(event.name, eventHandler, event.capture);
		}
	}

	attachListeners();
	
	// Wrapped in a timeout because some apps (like http://qiyukf.com/) does some wonky shit
	// to the DOM after document load and the event listeners were not attached.
	setTimeout(attachListeners, 20);
}
