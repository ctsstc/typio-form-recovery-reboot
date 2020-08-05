import optionSanitizer from './optionSanitizer';
import defaultOptions from './defaultOptions';

const options = {};
var hasLoadedFromStorage;

// Default values, can be overwritten and saved in chrome
var globalOptions = optionSanitizer.sanitize(defaultOptions.getAll())

options.set = function(opt, val) {
	var san = optionSanitizer.sanitize(opt, val)
	if(san !== undefined) {
		console.log('Writing to storage.sync');
		chrome.storage.sync.set({ [opt] : val });
		globalOptions[opt] = val
	} else {
		throw new Error('Option could not be sanitized', opt, val);
	}
}

options.setMany = function(options) {
	const keys = Object.keys(options);
	for(const key of keys) {
		if(optionSanitizer.sanitize(key, options[key]) === undefined) {
			console.error(key, ' was not saved because its value did not pass the sanitizer')
			delete options[key];
		}
	}
	console.log('Writing to storage.sync');
	chrome.storage.sync.set(options);
	globalOptions = { ...globalOptions, ...options };
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

				// Sanitize stored value
				var san = optionSanitizer.sanitize(opt, options[opt]);

				// If sanitazion passes, override default value
				if(san !== undefined) {
					globalOptions[opt] = san;
				}
			}
		}

		// console.log(globalOptions)

		hasLoadedFromStorage = true;
		if(callback) callback();
	});

}

export default options;