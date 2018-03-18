(function() {
	'use strict';
	
	// Used to check if script is already injected. Message is sent from background.js
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		
		// Used to check if content scripts are already injected
		if(request.action === 'ping') {
			sendResponse(true);
		} else {
			showError();

		}
	});

	function showError() {
		var enable = confirm(`Uh oh! The action cannot be performed because you have disabled Typio on this domain.\n\nDo you want to enable Typio again? The page will be refreshed.`);
		if(enable) {
			terafm.blacklist.unblock(location.hostname, function() {
				location.reload();
			})
		}
	}
})();