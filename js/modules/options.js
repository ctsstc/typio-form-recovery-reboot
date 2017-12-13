window.terafm = window.terafm || {};
window.terafm.options = {};

(function(options) {
	'use strict';

	// Default values, can be overwritten and saved in chrome
	var globalOptions = {
		savePasswords: false,
		saveCreditCards: false,
		storageTimeDays: 7,
		saveIndicator: 'topline',
		hideSmallEntries: true
	}

	var hasLoadedFromStorage;

	var optionSanitizers = {
		savePasswords: function(bool) {
			return bool == true ? true : false;
		},
		saveCreditCards: function(bool) {
			return bool == true ? true : false;
		},
		hideSmallEntries: function(bool) {
			return bool == true ? true : false;
		},
		storageTimeDays: function(days) {
			days = parseInt(days);
			return	(days > 0 && days < 366) ? days :
					(days > 365) ? 365 : 
					(days < 1) ? 1 :
					tera.options.storageTimeDays;
		},
		saveIndicator: function(value) {
			return ['topline', 'cornertriag', 'disable'].includes(value) ? value : 'disable';
		}
	};


	options.set = function(opt, val) {
		let obj = {};
		obj[opt] = val;
		chrome.storage.sync.set(obj);

		val = optionSanitizers[opt](val);
		globalOptions[opt] = val;
	}

	options.get = function(opt) {
		if(!hasLoadedFromStorage) return false;
		return globalOptions[opt];
	}

	options.getAll = function() {
		if(!hasLoadedFromStorage) return false;
		return globalOptions;
	}

	options.loadFromChromeStorage = function(callback) {

		// Override default options
		chrome.storage.sync.get(null, function(options) {
			if(options) {
				for(var opt in options) {
					if(opt in globalOptions) {
						globalOptions[opt] = optionSanitizers[opt](options[opt]);
					}
				}
			}

			hasLoadedFromStorage = true;
			if(callback) callback();
		});

	}

})(terafm.options);