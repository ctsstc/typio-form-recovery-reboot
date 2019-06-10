window.terafm = window.terafm || {};

(function() {
	'use strict';

	let storageData = {},
		storageKeys = [];

	terafm.cache = function(key, cacheFunction) {
		let keyId = storageKeys.indexOf(key);
		if(keyId !== -1) {
			return storageData[keyId]
		}

		keyId = storageKeys.push(key) -1;
		storageData[keyId] = cacheFunction();

		return storageData[keyId];
	};

})();
