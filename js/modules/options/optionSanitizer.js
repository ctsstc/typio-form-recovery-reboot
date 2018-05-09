window.terafm = window.terafm || {};
window.terafm.optionSanitizer = {};

(function(optionSanitizer) {
	'use strict';

	var sanitizers = {

		// Generic, can be reused
		bool: function(bool) {
			return bool == true ? true : false;
		},
		hexColor: function(value) {
			return /^(#[0-9a-f]{6}|[0-9a-f]{3})$/i.test(value) ? value : undefined;
		},
		yearInDays: function(days) {
			days = parseInt(days);
			return	(days > 0 && days < 366) ? days :
					(days > 365) ? 365 : 
					(days < 1) ? 1 :
					undefined;
		},

		// Specific ones
		keyBinding: function(value) {
			return value.replace(/\s/g, '').split('+');
			// return value.replace(/[^a-z+]/gi, '').split('+');
		},
		saveIndicator: function(value) {
			return ['topline', 'cornertriag', 'disable'].includes(value) ? value : undefined;
		},
		quickAccessTrigger: function(value) {
			return ['focus', 'doubleclick'].includes(value) ? value : undefined;
		}
	};


	var pointers = {
		savePasswords: sanitizers.bool,
		saveCreditCards: sanitizers.bool,
		hideSmallEntries: sanitizers.bool,
		saveIndicatorColor: sanitizers.hexColor,
		storageTimeDays: sanitizers.yearInDays,
		quickAccessButtonEnabled: sanitizers.bool,
		quickAccessButtonTrigger: sanitizers.quickAccessTrigger,
		cloneOnRestore: sanitizers.bool,
		resetEditablesBetweenRestorations: sanitizers.bool,

		keybindToggleRecDiag: sanitizers.keyBinding,
		keybindRestorePreviousSession: sanitizers.keyBinding,
		keybindOpenQuickAccess: sanitizers.keyBinding,
		keybindEnabled: sanitizers.bool
	}

	optionSanitizer.sanitize = function(name, value) {

		if(typeof name === 'object') {
			value = name;
			for(name in value) {
				value[name] = optionSanitizer.sanitize(name, value[name])
			}
			return value

		} else {
			
			// Sanitazer found (generic)
			if(name in pointers) {
				return pointers[name](value)

			// Custom sanitizer found (specific)
			} else if(name in sanitizers) {
				return sanitizers[name](value)

			// No sanitizer found, fail
			} else {
				return undefined;
			}

		}
	}

})(terafm.optionSanitizer);