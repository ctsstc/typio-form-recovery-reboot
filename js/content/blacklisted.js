(function() {
	
	// Used to check if script is already injected. Message is sent from background.js
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

		// Used to check if content scripts are already injected
		if(request.action === 'ping') {
			sendResponse(true);
		
		} else if(request.action === 'contextMenuRecover') {
			showError();

		} else if(request.action === 'openRecoveryDialog') {
			showError();

		}
	});

	function showError() {
		alert('You have disabled Typio on this website. Please open the settings and remove ' + window.location.hostname + ' from the blacklist.');
	}
})();