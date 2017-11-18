window.terafm = window.terafm || {};
window.terafm.options = (function() {
	'use strict';

	var globalOptions = {
		// Not saved in chrome
		editableTypes: ['color', 'date', 'datetime-local', 'email', 'month', 'number', 'password', 'checkbox', 'radio', 'range', 'search', 'tel', 'text', 'time', 'url', 'week'],
		textEditableTypes: ['text', 'email', 'search', 'password', 'url', 'tel'],

		// Default values, can be overwritten and saved in chrome
		savePasswords: false,
		storageTimeDays: 7,
	}

	var hasLoadedFromStorage;

	var exp = {};

	var optionSanitizers = {
		savePasswords: function(bool) {
			return bool == true ? true : false;
		},
		storageTimeDays: function(days) {
			days = parseInt(days);
			return	(days > 0 && days < 366) ? days :
					(days > 365) ? 365 : 
					(days < 1) ? 1 :
					tera.options.storageTimeDays;
		}
	};


	exp.get = function(opt) {
		return hasLoadedFromStorage ==  undefined || globalOptions[opt];
	}

	exp.getAll = function() {
		return hasLoadedFromStorage ==  undefined || globalOptions;
	}

	exp.loadFromChromeStorage = function(callback) {
		// Todo: Fix
		// return;

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
			callback();
		});

	}

	return exp;

})();