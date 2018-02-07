(function() {
	'use strict';

	// No support for cross domain frames
	try {
		window.top.document;
	} catch(e) {
		return;
	}

	// Run only in child frames
	if(window === window.top) {
		return;
	}


	function eventHandler(e) {
		let msg = {
			action: 'terafmEventCatcher',
			event: {
				path: [terafm.editableManager.genPath(e.path[0])],
				type: e.type
			}
		}

		// Special case for to send mouse coordinates
		if(e.type === 'contextmenu') {
			msg.event.pageX = e.pageX;
			msg.event.pageY = e.pageY;
		} else if(e.type === 'keydown') {
			msg.event.key = e.key;
			msg.event.ctrlKey = e.ctrlKey;
			msg.event.altKey = e.altKey;
		} else if(e.type === 'keyup') {
			msg.event.keyCode = e.keyCode;
		}

		// console.log(msg);
		window.top.postMessage(msg, '*');
	}


	document.addEventListener('input', eventHandler);
	document.addEventListener('keyup', eventHandler, true);
	document.addEventListener('contextmenu', eventHandler);
	document.addEventListener('mousedown', eventHandler);
	document.addEventListener('click', eventHandler);
	document.addEventListener('focus', eventHandler, true);
	document.addEventListener('blur', eventHandler, true);
	document.addEventListener('change', eventHandler, true);
	document.addEventListener('keydown', eventHandler, true);

})();