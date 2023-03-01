import Cache from '../../modules/Cache';
import { getEventTarget } from '../../modules/Helpers';
import PathGenerator from '../../modules/PathGenerator';

// Run only in child frames
if(window !== window.top) {

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
		const target = getEventTarget(e);

		console.log("TARGETTTT", { target })
		if (!target) return;

		let msg = {
			action: 'terafmEventCatcher',

			// Was previously only "event", but this caused videos to not play on digg.com because there
			// is an event listener and if the object isn't valid (according to them) they reload the page.
			// They listen for a "msg.event", so if we rename that to be unique that resolves the issue.
			terafmEvent: {
				path: [Cache.cache(target, () => PathGenerator(target))],
				type: e.type
			}
		}
	
		// Special case for to send mouse coordinates
		if(e.type === 'contextmenu') {
			msg.terafmEvent.pageX = e.pageX;
			msg.terafmEvent.pageY = e.pageY;
		} else if(e.type === 'keydown') {
			msg.terafmEvent.key = e.key;
		} else if(e.type === 'keyup') {
			msg.terafmEvent.keyCode = e.keyCode;
		}
	
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
