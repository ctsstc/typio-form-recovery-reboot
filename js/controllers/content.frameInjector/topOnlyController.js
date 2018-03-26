(function() {
	'use strict';

	// No support for cross domain frames
	try {
		window.top.document;
	} catch(e) {return;}
	

	// Run once in top window
	if(window !== window.top) {
		return;
	}


	window.top.addEventListener('message', function(msg) {

		if(msg.data.action && msg.data.action === 'terafmEventCatcher') {
			msg = msg.data.event;

			// Todo: Unclear; it can resolve path anywhere, not just editables.
			let target = terafm.resolvePath(msg.path[0]);

			if(target) {
				msg.path[0] = target;
				terafm.DOMEvents.trigger(msg.type, msg);
			}
			
		}
	})

})();