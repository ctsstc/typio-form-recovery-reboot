(function() {

	chrome.runtime.onInstalled.addListener(function(details) {
		if(true && details.reason === 'update') {
			let url = chrome.extension.getURL('html/splash.html');
			chrome.tabs.create({
				url: url
			})
		}
	})
	
})();