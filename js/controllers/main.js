var terafm = window.terafm;

(function() {
	'use strict';

	// Testing
	/*
			setTimeout(function() {
				console.log('---------------------');
				var t = document.querySelector('#shadow').shadowRoot.querySelector('div').shadowRoot.querySelector('iframe').contentWindow.document.querySelector('.sec').shadowRoot.querySelector('input');
				var path = terafm.editableManager.genPath(t);

				console.log('generated:', path);
				var found = $(path);
				console.log('found:', found);
				return;
				
			}, 500);

			// if(window.location.host === 's.codepen.io' && window.top === window) {
			// 	setTimeout(function() {
			// 		terafm.dialog.open();
			// 	}, 300); 
			// }
	*/


	// Initiate DB, populate in-memory storage
	terafm.db.init(function() {

		// // Load extension options into memory
		terafm.options.loadFromChromeStorage(function() {
			console.log('options loaded');

		});

	});

	// // Initiated because it listens for rightclicks (html only injected when contextmenu is triggered)
	// terafm.context.setup();



	// Used to check if script is already injected. Message is sent from background.js
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

		// Used to check if content scripts are already injected
		if(request.action === 'ping') {
			sendResponse(true);
		
		} else if(request.action === 'clearData') {
			terafm.db.deleteAllSessions();
			terafm.dialog.close();
		}
	});

})();