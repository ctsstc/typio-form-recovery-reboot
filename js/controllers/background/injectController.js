(function() {
	chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {

		// If not complete or invalid URL
		if (change.status !== 'complete' || !tab.url.match(/^https?:\/\//)) {
			return false;
		}

		var hostname = new URL(tab.url).hostname;

		// Check if blacklisted on this domain
		terafm.blacklist.isBlocked(hostname, function(isBlacklisted) {
			chrome.tabs.sendMessage(tabId, {action: 'ping'}, function(response) {

				// Already injected, let's bail
				if(response === true) {
					return false;
				}

				// Page is blacklisted!
				if(isBlacklisted) {
					chrome.tabs.executeScript(tabId, {file: 'js/content.blacklisted.js', runAt: 'document_start', allFrames: true});
					return false;
				}
				
				chrome.tabs.executeScript(tabId, {file: 'js/vue.runtime.js', runAt: 'document_start'});
				chrome.tabs.executeScript(tabId, {file: 'js/content.js', runAt: 'document_start'});
				chrome.tabs.executeScript(tabId, {file: 'js/content.frameInjector.js', runAt: 'document_end', allFrames: true});
			});
		});
	});
})();