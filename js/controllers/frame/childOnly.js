(function() {
	'use strict';

	try {
		window.top.document;
	} catch(e) {return;}

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
		}

		window.top.postMessage(msg, '*');
	}


	// Run only in child frames
	if(window !== window.top) {
		window.terafm = window.terafm || {};

		document.addEventListener('input', eventHandler);
		document.addEventListener('contextmenu', eventHandler);
		document.addEventListener('mousedown', eventHandler);
		document.addEventListener('click', eventHandler);
		document.addEventListener('focus', eventHandler, true);
		document.addEventListener('blur', eventHandler, true);
		document.addEventListener('change', eventHandler, true);
		document.addEventListener('keydown', eventHandler, true);

	}


})();