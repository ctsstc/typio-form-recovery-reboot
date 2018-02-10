window.terafm = window.terafm || {};
window.terafm.options = {};

(function(options, defaultOptions) {
	'use strict';

	var hasLoadedFromStorage;


	// Default values, can be overwritten and saved in chrome
	var globalOptions = defaultOptions.getAll()

	var optionSanitizers = {
		bool: function(bool) {
			return bool == true ? true : false;
		},
		keyBinding: function(value) {
			return value.replace(/[^a-z+]/gi, '').split('+')
		},
		hexColor: function(value) {
			return /^(#[0-9a-f]{6}|[0-9a-f]{3})$/i.test(value) ? value : globalOptions.saveIndicatorColor;
		},
		storageTimeDays: function(days) {
			days = parseInt(days);
			return	(days > 0 && days < 366) ? days :
					(days > 365) ? 365 : 
					(days < 1) ? 1 :
					globalOptions.storageTimeDays;
		},
		saveIndicator: function(value) {
			return ['topline', 'cornertriag', 'disable'].includes(value) ? value : globalOptions.saveIndicator;
		}
	};


	var optionSanitationPointers = {
		savePasswords: optionSanitizers.bool,
		saveCreditCards: optionSanitizers.bool,
		hideSmallEntries: optionSanitizers.bool,
		saveIndicatorColor: optionSanitizers.hexColor,

		keybindToggleRecDiag: optionSanitizers.keyBinding,
		keybindRestorePreviousSession: optionSanitizers.keyBinding,
		keybindEnabled: optionSanitizers.bool
	}

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


					// console.log(opt, opt in optionSanitationPointers);continue

					// Check if there is a shared sanitizer (like a bool or something)
					if(opt in optionSanitationPointers) {
						globalOptions[opt] = optionSanitationPointers[opt](options[opt])

					// Otherwise assume there is a unique one. Will fail if nonexistent.
					} else if(opt in globalOptions) {
						globalOptions[opt] = optionSanitizers[opt](options[opt]);
					}
				}
			}

			hasLoadedFromStorage = true;
			if(callback) callback();
		});

	}

})(terafm.options, terafm.defaultOptions);