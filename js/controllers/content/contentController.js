var terafm = window.terafm;

(function(db, options, initHandler) {
	'use strict';

	terafm.blacklist.isBlocked(window.location.href, function(blocked) {
		if(blocked) {
			terafm.isBlocked = true;
		
		} else {
			// Load extension options into memory
			options.loadFromChromeStorage(function() {
				
				// Initiate DB, populate in-memory storage
				db.init(function() {

					// Run init handlers
					initHandler.executeInitHandlers();
					console.log('Typio is ready!');
				});
			});
		}
	});


	// Messages from background.js
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'clearData') {
			if(terafm.isBlocked) return terafm.blockController.warn();
			db.deleteAllDataForDomain();
			terafm.toastController.create('Database cleared for ' + window.location.hostname);
		}
	});




	

})(terafm.db, terafm.options, terafm.initHandler);