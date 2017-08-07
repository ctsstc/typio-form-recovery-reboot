

var toggleBlackButton = document.getElementById('toggleBlacklist'),
	clearDataButton = document.getElementById('clearDomainStorage'),
	moreOptionsLink = document.getElementById('moreOptionsLink'),
	openDialogLink = document.getElementById('openDialogTrigger'),
	tabId, url;

chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
	url = new URL(tabs[0].url).hostname;
	tabId = tabs[0].id;

	isBlocked(function(state) {
		_setBlockButtonState(state);
	});
});

moreOptionsLink.addEventListener('click', function() {
	chrome.runtime.openOptionsPage();
});

clearDataButton.addEventListener('click', function() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {action: 'clearData'});
	});
	clearDataButton.innerHTML = 'Data deleted';
	clearDataButton.disabled = true;
});


toggleBlackButton.addEventListener('click', function() {
	if(toggleBlackButton.dataset.blocked == 1) {
		unblock();
		_setBlockButtonState(0);
	} else {
		block();
		_setBlockButtonState(1);
	}
});

openDialogLink.addEventListener('click', function() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {action: 'openRecoveryDialog'});
	});
})

function isBlocked(callback) {
	_getBlocked(function(list) {
		var regex = new RegExp('.*' + (url.replace('.', '\.')), 'gi'),
			res = list.match(regex) !== null ? true : false;

		callback(res);
	});
}
function unblock() {
	_getBlocked(function(list) {
		var regex = new RegExp('[\r\n]*.*' + (url.replace('.', '\.')) + '[\r\n]*.*', 'gi');

		list = list.replace(regex, '');
		chrome.storage.sync.set({domainBlacklist: list});
	});
}
function block() {
	_getBlocked(function(list) {
		list += url + "\r\n";
		chrome.storage.sync.set({domainBlacklist: list});
	});
}

function _getBlocked(callback) {
	chrome.storage.sync.get('domainBlacklist', function(stored) {
		callback('domainBlacklist' in stored ? stored.domainBlacklist : '');
	});
}

function _setBlockButtonState(blocked) {
	if(blocked) {
		toggleBlackButton.innerHTML = 'Enable Typio on this site';
		toggleBlackButton.dataset.blocked = 1;
	} else {
		toggleBlackButton.innerHTML = 'Disable Typio on this site';
		toggleBlackButton.dataset.blocked = 0;
	}
}