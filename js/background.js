

var tabUrlHistory = {};


// When the toolbar icon is clicked
chrome.browserAction.onClicked.addListener(function(tab) {
	alert("test");
});


chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {

	// If not complete or invalid URL
	if (change.status !== 'complete' || !tab.url.match(/^https?:\/\//)) {
		return false;
	}

	chrome.tabs.sendMessage(tabId, {action: 'ping'}, function(response) {

		// Already injected, let's bail
		if(response) {
			return false;
		}

		chrome.tabs.executeScript(tabId, {file: 'js/content.js'});
		chrome.tabs.insertCSS(tabId, {file: 'css/content.css'});
	});
});