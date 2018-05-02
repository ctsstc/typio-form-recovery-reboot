(function() {

	chrome.runtime.onInstalled.addListener(function(details) {
		if(details.reason === 'update' && false) {
			let url = chrome.extension.getURL('html/splash.html');
			chrome.tabs.create({
				url: url
			})
		}
	})
	
})();