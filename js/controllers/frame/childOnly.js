(function() {
	'use strict';

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
		}

		window.top.postMessage(msg, '*');
	}


	// Run only in child frames
	if(window !== window.top) {
		window.terafm = window.terafm || {};

		document.addEventListener('input', function(e) {
			// console.log('input', e, e.target.value);
		});

		// document.addEventListener('click', eventHandler);
		document.addEventListener('keyup', eventHandler);
		document.addEventListener('contextmenu', eventHandler);
		document.addEventListener('mousedown', eventHandler);
		document.addEventListener('focus', eventHandler, true);
		document.addEventListener('blur', eventHandler, true);
		document.addEventListener('change', eventHandler, true); // Todo: Add useCapture (true)?

	}


})();