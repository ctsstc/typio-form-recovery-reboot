

var toggleBlackButton = document.getElementById('toggleBlacklist'),
	clearDataButton = document.getElementById('clearDomainStorage'),
	moreOptionsLink = document.getElementById('moreOptionsLink'),
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
	clearDataButton.innerHTML = 'Deleting...';
	chrome.tabs.executeScript(tabId, {
		runAt: 'document_end',
		code: "for(i in localStorage) if(i.indexOf('teraField') !== -1) localStorage.removeItem(i);"
	}, 	function() {
		clearDataButton.innerHTML = 'Data deleted';
		clearDataButton.disabled = true;
	});
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

function isBlocked(callback) {
	_getBlocked(function(list) {
		var regex = new RegExp('.*' + (url.replace('.', '\.')), 'gi'),
			res = list.match(regex) !== null ? true : false;

		callback(res);
	});
}
function unblock() {
	_getBlocked(function(list) {
		var regex = new RegExp('[\r\n]*.*' + (url.replace('.', '\.')), 'gi');

		list = list.replace(regex, '');
		chrome.storage.sync.set({domainBlacklist: list});
	});
}
function block() {
	_getBlocked(function(list) {
		list += "\r\n" + url;
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
		toggleBlackButton.innerHTML = 'Remove from blacklist';
		toggleBlackButton.dataset.blocked = 1;
	} else {
		toggleBlackButton.innerHTML = 'Add to blacklist';
		toggleBlackButton.dataset.blocked = 0;
	}
}