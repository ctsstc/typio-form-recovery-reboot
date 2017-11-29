window.terafm = window.terafm || {};
window.terafm.options = {};

(function(options) {
	'use strict';

	var globalOptions = {
		// Not saved in chrome
		editableTypes: ['color', 'date', 'datetime-local', 'email', 'month', 'number', 'password', 'checkbox', 'radio', 'range', 'search', 'tel', 'text', 'time', 'url', 'week'],
		textEditableTypes: ['text', 'email', 'search', 'password', 'url', 'tel'],

		// Default values, can be overwritten and saved in chrome
		savePasswords: false,
		storageTimeDays: 7,
		saveIndicator: 'cornertriag',
		hideSmallEntries: true
	}

	var hasLoadedFromStorage;

	var optionSanitizers = {
		savePasswords: function(bool) {
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

	// Todo: Fix error thingy
	options.get = function(opt) {
		if(!hasLoadedFromStorage) return 'ERROR';
		// console.log('getting', opt, globalOptions[opt])
		return globalOptions[opt];
	}

	options.getAll = function() {
		if(!hasLoadedFromStorage) return 'ERROR';
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

			console.log('loaded from storage');
			hasLoadedFromStorage = true;
			if(callback) callback();
		});

	}

})(terafm.options);