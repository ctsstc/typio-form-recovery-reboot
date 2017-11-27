(function() {
	'use strict';

	// Run once in top window
	if(window === window.top) {

		window.top.addEventListener('message', function(msg) {

			if(msg.data.action && msg.data.action === 'terafmEventCatcher') {
				msg = msg.data.event;

				msg.path[0] = terafm.editableManager.resolvePath(msg.path[0]);

				if(msg.path[0]) {
					terafm.DOMEvents.trigger(msg.type, msg);
				} else {
					console.warn('Typio encapsulated event did not propagate because the path could not be resolved.');
				}
				
			} else if(msg.data.action && msg.data.action === 'terafmRequestBasepath') {
				window.top.postMessage({
					action: 'terafmReturnBasepath',
					path: chrome.extension.getURL('')
				}, '*');
			}
		})

	}

})();