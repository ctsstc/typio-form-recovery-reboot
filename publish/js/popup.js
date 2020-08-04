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
(function(blacklist) {

	let hostnamePlaceholder = document.querySelector('.js-hostname'),
		blacklistToggleBtn = document.querySelector('.head-toggle'),
		urlObj;

	document.addEventListener('click', function(e) {
		e.preventDefault();

		let target = e.target;

		// Open recovery link
		if(target.classList.contains('open-recovery-link')) {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {action: 'openRecoveryDialog'});
			});

		// Open options link
		} else if(target.classList.contains('open-options-link')) {
			chrome.runtime.openOptionsPage();

		// Show key combos
		} else if(target.classList.contains('open-keyboard-shortcuts')) {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {action: 'showKeyboardShortcuts'});
			});

		// Delete all link
		} else if(target.classList.contains('delete-all-link')) {
			if(target.classList.contains('confirm-click')) {
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					chrome.tabs.sendMessage(tabs[0].id, {action: 'clearData'});

					target.innerHTML = 'Data has been deleted';
					target.classList.remove('confirm-click');
					target.classList.add('green');
					target.classList.remove('delete-all-link'); // Disable this action on link
				});
			} else {
				target.classList.add('confirm-click');
				target.innerHTML = 'Click again to confirm deletion of all data on ' + urlObj.hostname + '. Deletion cannot be undone.';
			}

		}
	})




	// Get hostname for current tab
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		urlObj = new URL(tabs[0].url);

		hostnamePlaceholder.innerHTML = urlObj.hostname;

		blacklist.isBlocked(urlObj.href, function(bool) {
			if(bool) {
				blacklistToggleBtn.classList.remove('is-enabled');
			}
		})
	});



	// Toggle blacklist button
	blacklistToggleBtn.addEventListener('mousedown', function(e) {
		
		// Add to blacklist
		if(blacklistToggleBtn.classList.contains('is-enabled')) {
			blacklist.blockDomain(urlObj.hostname);

		// Remove from blacklist
		} else {
			blacklist.unblock(urlObj.href);

		}

		blacklistToggleBtn.classList.toggle('is-enabled');
	});
})(terafm.blacklist);