window.terafm = window.terafm || {};
terafm.blacklist = {};

(function(blacklist) {

	blacklist.getAll = function(callback) {
		getOptionData(callback)
	}

	blacklist.blockDomain = function(domain) {
		getOptionData(function(list) {
			if(isBlocked(list, domain) === false) {
				list.push(domain);
				saveList(list);
			}
		});
	}

	blacklist.unblock = function(url, callback) {
		getOptionData(function(list) {
			let index = isBlocked(list, url);
			if(index !== false) {
				list.splice(index, 1);
				saveList(list, callback);
			}
		});
	}

	blacklist.isBlocked = function(url, callback) {
		getOptionData(function(list) {
			callback(isBlocked(list, url) !== false );
		});
	}

	function isBlocked(list, url) {

		let index = list.indexOf(url);
		if(index !== -1) return index;

		try {
			// Full URL was passed
			let urlObj = new URL(url);

			// Check if hostname is blocked
			let index = list.indexOf(urlObj.hostname);
			if(index !== -1) return index;


			// Loop through items and compare individually
			for(let pi in list) {
				let pattern = list[pi];

				// Regex
				let regex = isRegex(pattern);
				if(regex !== false) {
					if(regex.test(url)) {
						return pi;
					}

					// Wildcard
				} else if(pattern.indexOf('*') !== -1) {
					let wild = wildcardCheck(pattern, urlObj.hostname);
					if(wild) return pi;
				}
			}

			// Domain was passed instead of URL
		} catch(e) {

			let domain = url;

			console.log(domain);

			let index = list.indexOf(domain);
			if(index !== -1) return index;

			for(let pi in list) {
				// Wildcard
				if(list[pi].indexOf('*') !== -1) {
					let wild = wildcardCheck(list[pi], domain);
					if(wild) return pi;
				}
			}
		}


		function wildcardCheck(pattern, hostname) {
			try {
				let regex = new RegExp( pattern.replace('.', '\.?').replace('*', '.*?') );
				if(regex.test(hostname)) {
					return true;
				}
			} catch(e){}
		}


		return false;
	}

	function isRegex(string) {
		if(string.length > 3 && string.indexOf('/') === 0 && string.slice(-1) === '/') {
			let tmp = string.substring(1, string.length-1);
			try {
				return new RegExp(tmp);
			} catch(e) {}
		}
		return false;
	}

	function saveList(list, callback) {
		chrome.storage.sync.set({'domainBlacklist': list}, function(set) {
			if(callback) callback();
		});
	}


	function getOptionData(callback) {
		chrome.storage.sync.get('domainBlacklist', function(data) {
			data = convertLegacy(data['domainBlacklist']);
			callback(data);
		})
	}


	// Old blacklist was saved as a big text field with one domain per line
	// If the old format is still used, this function converts the data
	// into array format.
	function convertLegacy(blob) {

		// Empty array or string or null
		if(!blob) {
			return [];

			// If string, convert to array
		} else if(typeof blob === 'string') {
			blob = (blob + "").split(/[\r|\n]+/g).filter(word => word.trim().length > 0);
			return blob;

			// Already array
		} else {
			return blob;
		}
	}

})(terafm.blacklist);
(function() {
	
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'openSettings') {
			chrome.runtime.openOptionsPage();
		}
	});


	// In case i need it for future stuff
	chrome.storage.sync.set({version: 2});

})();
(function() {

	// chrome.idle.setDetectionInterval(15); // seconds
	chrome.idle.setDetectionInterval(60); // seconds
	chrome.idle.onStateChanged.addListener(function(state) {
		if(state === 'idle') {
			chrome.storage.local.get('DBMaintenanceTimestamp', function(res) {
				let lastrun = res.DBMaintenanceTimestamp || 0;

				if(Date.now() - lastrun > 43200000) { // 12 hours
					console.log('Is idle, running maintenance')
					runMaintenance();
					chrome.storage.local.set({ DBMaintenanceTimestamp: Date.now() });
				} else {
					console.log('Is idle but maintenance has already been ran.')
				}
			})
		}
	});

	function runMaintenance() {

		chrome.storage.sync.get('storageTimeDays', function(data) {
			let maxdays = data.hasOwnProperty('storageTimeDays') ? data['storageTimeDays'] : 7; // Todo: Default is hard coded!
			let expirepoint = (Date.now()/1000) - (maxdays * 86400);

			// Delete old stuff
			chrome.storage.local.get(null, function(data) {

				// Loop through all domains in storage

				for(let domain in data) {
					if(domain.indexOf('###') !== 0 || !data[domain].hasOwnProperty('fields')) continue;
					let action = 'ignore';

					// console.log('data for', domain, JSON.parse(JSON.stringify(data[domain])))

					// If empty domain (nothing stored in domain)
					if(Object.keys(data[domain].fields) < 1) {
						action = 'delete';

					} else {
						for(let fieldId in data[domain].fields) {

							// Loop through every session id per field
							for(let sessionId in data[domain].fields[fieldId].sess) {
								if(sessionId < expirepoint) {

									// console.log(sessionId, data[domain].fields[fieldId].sess[sessionId])

									// Delete entry
									delete data[domain].fields[fieldId].sess[sessionId];

									// Delete entire field if empty
									if(Object.keys(data[domain].fields[fieldId].sess).length < 1) {
										delete data[domain].fields[fieldId]
									}

									action = 'save';

									// Delete entire field if empty
									if(Object.keys(data[domain].fields).length < 1) {
										action = 'delete';
									}
								}

							}
						}
					}

					// Write changes
					if(action === 'save') {
						console.log('maintenance run on', domain/*, JSON.parse(JSON.stringify(data[domain]))*/);
						chrome.storage.local.set({[domain]: data[domain]});

					} else if(action === 'delete') {
						console.log('maintenance deleted', domain)
						chrome.storage.local.remove(domain);
					}
				}

			});
		});
	}

})();

/*(function() {
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
*/

(function() {
	chrome.storage.sync.get('hideContextItems', function(obj) {
		if(obj.hideContextItems !== true) {
			createContextMenus();
		}
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