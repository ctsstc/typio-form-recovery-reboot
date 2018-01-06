window.terafm = window.terafm || {};
terafm.blacklist = {};

(function(blacklist) {

	blacklist.getAll = function(callback) {
		getOptionData(callback)
	}

	blacklist.block = function(domain) {
		getOptionData(function(list) {
			list.push(domain);
			saveList(list);
		});
	}

	blacklist.unblock = function(domain, callback) {
		getOptionData(function(list) {
			if(list.includes(domain)) {
				list.splice(list.indexOf(domain), 1);
				saveList(list, callback);
			}
		});
	}

	blacklist.isBlocked = function(domain, callback) {
		getOptionData(function(list) {
			if(list.includes(domain)) {
				callback(true);
				return true;
			}
			callback(false);
		});
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