
chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {

	// If not complete or invalid URL
	if (change.status !== 'complete' || !tab.url.match(/^https?:\/\//)) {
		return false;
	}

	// Check if blacklisted on this domain
	isBlacklisted(tab.url, function(isBlacklisted) {

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
			
			// Will execute on every page (not iframes)
			chrome.tabs.executeScript(tabId, {file: 'js/min/content.min.js', runAt: 'document_start'});

			// Will only execute in iframes
			chrome.tabs.executeScript(tabId, {file: 'js/min/frame.min.js', runAt: 'document_start', allFrames: true});
		});
	});
});

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
	if(details.reason === 'update') {
		let url = chrome.extension.getURL('html/splash.html');
		chrome.tabs.create({
			url: url
		})
	}
})


function getOption(option, callback) {
	chrome.storage.sync.get(option, function(obj) {
		if(obj[option] !== undefined) {
			callback(obj[option]);
		} else {
			callback(false);
		}
	});
}


function isBlacklisted(url, callback) {

	// Grab current hostname with subdomain
	var currDom = new URL(url).hostname;

	getOption('domainBlacklist', function(stored) {
		if(!stored) {
			callback(false);
			return false;
		}
		var domains = stored.split(/\r|\n/g);
		
		// Loop through all domains
		if(domains.length > 0) {
			for(var i=0; i < domains.length; ++i) {
				var dom = domains[i];
				if(dom.indexOf(currDom) !== -1) {
					callback(true);
					return true;
				}
			}
		}
		callback(false);
	});
}