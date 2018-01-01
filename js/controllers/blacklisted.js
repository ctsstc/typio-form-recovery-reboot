(function() {
	'use strict';
	
	// Used to check if script is already injected. Message is sent from background.js
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		
		// Used to check if content scripts are already injected
		if(request.action === 'ping') {
			sendResponse(true);
		
		} else if(request.action === 'contextMenuRecover') {
			showError();

		} else if(request.action === 'openRecoveryDialog') {
			showError();

		} else if(request.action === 'clearData') {
			alert('Your data cannot be deleted because Typio is disabled on this domain. If Typio is enabled, try refreshing the page before deleting the data')
		}
	});

	function showError() {
		alert('You have disabled Typio on this domain. Please open the settings and remove ' + window.location.hostname + ' from the blacklist.');
	}
})();