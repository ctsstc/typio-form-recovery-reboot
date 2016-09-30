
chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {

	// If not complete or invalid URL
	if (change.status !== 'complete' || !tab.url.match(/^https?:\/\//)) {
		return false;
	}

	// Check if blacklisted on this domain
	isBlacklisted(tab.url, function(isBlacklisted) {
		if(isBlacklisted) return false;

		chrome.tabs.sendMessage(tabId, {action: 'ping'}, function(response) {

			// Already injected, let's bail
			if(response === true) {
				return false;
			}

			chrome.tabs.executeScript(tabId, {file: 'js/content.js', runAt: 'document_end'});
			chrome.tabs.insertCSS(tabId, {file: 'css/content.css'});
		});
	});
});

chrome.contextMenus.create({
	id: 'teraRecover',
	title : 'Recover field text',
	contexts : ['editable']
});

chrome.contextMenus.onClicked.addListener(function(data) {
	if(data.menuItemId === 'teraRecover') {
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {action: 'contextMenuRecover'});
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
		chrome.tabs.create({'url': '/options.html' });
	}

});


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