window.terafm = window.terafm || {};
terafm.blacklist = {};

(function(blacklist) {

	blacklist.getAll = function(callback) {
		getOptionData(callback)
	}

	blacklist.block = function(domain) {
		getOptionData(function(list) {
			if(domainInList(list, domain) === false) {
				list.push(domain);
				saveList(list);
			}
		});
	}

	blacklist.unblock = function(domain, callback) {
		getOptionData(function(list) {
			let index = domainInList(list, domain);
			if(index !== false) {
				list.splice(index, 1);
				saveList(list, callback);
			}
		});
	}

	blacklist.isBlocked = function(domain, callback) {
		getOptionData(function(list) {
			callback(domainInList(list, domain) !== false );
		});
	}

	function domainInList(list, domain) {

		// Check simple first
		let index = list.indexOf(domain);
		if(index !== -1) return index;

		// Loop through regex and check
		for(let pi in list) {
			let pattern = list[pi];

			// Regex
			let regex = isRegex(pattern);
			if(regex !== false) {
				if(regex.test(domain)) {
					return pi;
				}

			// Wildcard
			} else if(pattern.indexOf('*') !== -1) {
				try {
					let regex = new RegExp( pattern.replace('.', '\.?').replace('*', '.*?') )
					if(regex.test(domain)) {
						return pi;
					}
				} catch(e){}
			}
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