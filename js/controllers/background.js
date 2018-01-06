
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

			console.log('injecting', !isBlacklisted)

			// Page is blacklisted!
			if(isBlacklisted) {
				chrome.tabs.executeScript(tabId, {file: 'js/content.blacklisted.js', runAt: 'document_start', allFrames: true});
				return false;
			}
			
			chrome.tabs.executeScript(tabId, {file: 'js/content.js', runAt: 'document_start'});
			chrome.tabs.executeScript(tabId, {file: 'js/content.frameInjector.js', runAt: 'document_end', allFrames: true});
		});
	});
});

try {
	chrome.contextMenus.create({
		id: 'recoverEditable',
		title : 'Recover this field',
		contexts : ['editable']
	});

	chrome.contextMenus.create({
		id: 'openRecoveryDialog',
		title : 'Open form recovery',
		contexts : ['all']
	});
} catch(e) {}

chrome.contextMenus.onClicked.addListener(function(data) {

	if(data.menuItemId === 'recoverEditable') {
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {action: 'contextMenuRecover'});
		});

	} else if(data.menuItemId === 'openRecoveryDialog') {
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {action: 'openRecoveryDialog'});
		});
	}
});



chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	if(request.action === 'blockDomain') {
		chrome.storage.sync.get('domainBlacklist', function(blacklisted) {
			var blacklisted = blacklisted.domainBlacklist;

			if(blacklisted.indexOf(request.domain) === -1) {
				if(blacklisted.length > 0) {
					blacklisted += "\r\n"
				}
				blacklisted += request.domain;
				chrome.storage.sync.set({domainBlacklist : blacklisted});
			}
		});
	}
	else if(request.action === 'openSettings') {
		chrome.runtime.openOptionsPage();
	}

});


// Show splash after update
chrome.runtime.onInstalled.addListener(function(details) {
	if(details.reason === 'update' && false) {
		let url = chrome.extension.getURL('html/splash.html');
		chrome.tabs.create({
			url: url
		})
	}
})
chrome.storage.sync.set({version: 2}); // In case i need it for future stuff