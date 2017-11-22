window.terafm = window.terafm || {};

(function() {
	'use strict';

	let storageData = {},
		storageKeys = [];

	terafm.cache = function(key, cacheFunction) {
		// console.log(storageData, storageKeys);
		// console.log('looking for', key, 'in', storageKeys)

		// If key exists, return cached value
		// If not cached, run cacheFunction and cache return value

		let keyId = storageKeys.indexOf(key);
		if(keyId !== -1) {
			return storageData[keyId]
		}

		keyId = storageKeys.push(key) -1;
		storageData[keyId] = cacheFunction();

		return storageData[keyId];
	};

})();