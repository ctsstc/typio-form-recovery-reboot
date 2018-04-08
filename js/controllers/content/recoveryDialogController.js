window.terafm = window.terafm || {};
terafm.recoveryDialogController = {};

(function(recoveryDialogController, recoveryDialog, db, help, editableManager, options, keyboardShortcuts, initHandler) {
	'use strict';

	if(window.location.hostname !== 'localhost') return;

	let diagRootNode,
		sessionlist,
		currentry;

	initHandler.onInit(() => {
		recoveryDialog.build((node) => {
			diagRootNode = node;
			setupEventListeners();
			sessionlist = db.getAllSessions();
			recoveryDialog.show();
			recoveryDialog.populate(sessionlist);
		} )
	} );

	function setupEventListeners() {
		diagRootNode.addEventListener('click', function(e) {
			let target = e.target;
			if(target.matches('.session-data ul > li') || target.closest('.session-data ul > li')) {
				if(target.nodeName.toLowerCase() !== 'li') target = target.closest('.session-data ul > li')

				let data = target.dataset;
				currentry = sessionlist.getEntry(data.sessionId, data.editableId);
				recoveryDialog.setEntry(currentry);
			}
		});
	}

})(terafm.recoveryDialogController, terafm.recoveryDialog, terafm.db, terafm.help, terafm.editableManager, terafm.options, terafm.keyboardShortcuts, terafm.initHandler);