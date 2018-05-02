(function() {
	
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'openSettings') {
			chrome.runtime.openOptionsPage();
		}
	});


	// In case i need it for future stuff
	chrome.storage.sync.set({version: 2});

})();