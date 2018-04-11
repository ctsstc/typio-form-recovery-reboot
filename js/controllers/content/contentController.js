var terafm = window.terafm;

(function(db, options, recoveryDialog, initHandler, Events, editableManager) {
	'use strict';

	// Load extension options into memory
	options.loadFromChromeStorage(function() {
		
		// Initiate DB, populate in-memory storage
		db.init(function() {

			// Run init handlers
			initHandler.executeInitHandlers();

			// var sesss = db.getSessions();
			// console.log(sesss.getEntriesByEditable('field-1712385224'))

			// let s = db.getSessions();
			// let s = db.getSessionsContainingEditable('field-1712385224');
			// console.log(s);
			// console.log(s.truncate(1));

			// let sess = db.getSession('1522235705');//('1522147757');
			// console.log(sess)
			// sess.filter(entry => !!entry.getEditable())
			// console.log(sess.initLength, sess.length);

			// let entry = db.getEntry('1522094138', 'field-1712385224');
			// console.log(entry.restore(true))
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
	

})(terafm.db, terafm.options, terafm.recoveryDialog, terafm.initHandler, terafm.Events, terafm.editableManager);