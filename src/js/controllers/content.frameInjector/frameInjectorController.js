import Cache from '../../modules/Cache';
import PathGenerator from '../../modules/PathGenerator';

// Run only in child frames
if(document !== window.top.document) {

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
			// msg.event.ctrlKey = e.ctrlKey;
			// msg.event.altKey = e.altKey;
		} else if(e.type === 'keyup') {
			msg.event.keyCode = e.keyCode;
		}
	
		// console.log(msg);
		window.top.postMessage(msg, '*');
	}
	
	// Wrapped in a timeout because some apps (like http://qiyukf.com/) does some wonky shit
	// to the DOM after document load and the event listeners were not added.
	setTimeout(() => {
		document.addEventListener('input', eventHandler);
		document.addEventListener('keyup', eventHandler, true);
		document.addEventListener('contextmenu', eventHandler);
		document.addEventListener('mousedown', eventHandler);
		document.addEventListener('click', eventHandler);
		document.addEventListener('dblclick', eventHandler);
		document.addEventListener('focus', eventHandler, true);
		document.addEventListener('blur', eventHandler, true);
		document.addEventListener('change', eventHandler, true);
		document.addEventListener('keydown', eventHandler, true);
	})
}
