(function() {
	// Only add context menus on install
	chrome.runtime.onInstalled.addListener(() => {
		chrome.storage.sync.get('hideContextItems', function(obj) {
			if(obj.hideContextItems !== true) {
				createContextMenus();
			}
		})
	})


	// React to changes
	chrome.storage.onChanged.addListener(function(changes, namespace) {
		if(changes.hideContextItems && changes.hideContextItems.newValue === true) {
			chrome.contextMenus.removeAll();

		} else if(changes.hideContextItems && changes.hideContextItems.newValue === false) {
			createContextMenus();
		}
	})

	function createContextMenus() {
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
	}

	chrome.contextMenus.onClicked.addListener(function(data) {

		if(data.menuItemId === 'recoverEditable') {
			chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {action: 'openQuickAccess'});
			});

		} else if(data.menuItemId === 'openRecoveryDialog') {
			chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {action: 'openRecoveryDialog'});
			});
		}
	});
})();
