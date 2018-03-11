var terafm = window.terafm;

(function(db, options, recoveryDialog, initHandler, DOMEvents, editableManager) {
	'use strict';

	// Load extension options into memory
	options.loadFromChromeStorage(function() {

		
		// Initiate DB, populate in-memory storage
		db.init(function() {

			// Run init handlers
			initHandler.executeInitHandlers();

			// If something has autofocus, trigger fake focus event
			setTimeout(function() {
				if(editableManager.isEditableText(document.activeElement) && editableManager.checkRules(document.activeElement)) {
					DOMEvents.trigger('focus', {path: [document.activeElement]});
				}
			}, 100)
		});
	});




	// Messages from background.js
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

		// Used to check if content scripts are already injected
		if(request.action === 'ping') {
			sendResponse(true);
		
		} else if(request.action === 'clearData') {
			db.deleteAllSessions();
			recoveryDialog.hide();
		}
	});
	

})(terafm.db, terafm.options, terafm.recoveryDialog, terafm.initHandler, terafm.DOMEvents, terafm.editableManager);