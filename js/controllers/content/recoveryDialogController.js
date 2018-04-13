window.terafm = window.terafm || {};
terafm.recoveryDialogController = {};

(function(recoveryDialogController, recoveryDialog, db, help, editableManager, options, keyboardShortcuts, initHandler) {
	'use strict';

	if(window.location.hostname !== 'localhost') return;

	let diagRootNode,
		sessionlist,
		currentry;

	// initHandler.onInit(() => {
	// 	recoveryDialog.build((node) => {
	// 		diagRootNode = node;
	// 		setupEventListeners();
	// 		sessionlist = db.getSessions();
	// 		recoveryDialog.show();
	// 		recoveryDialog.populate(sessionlist);
	// 	} )
	// } );

	function setupEventListeners() {
		diagRootNode.addEventListener('click', function(e) {
			let target = e.target;
			if(target.matches('.session-data ul > li') || target.closest('.session-data ul > li')) {
				if(target.nodeName.toLowerCase() !== 'li') target = target.closest('.session-data ul > li')

				remSel();
				target.classList.add('selected');
				let data = target.dataset;
				currentry = sessionlist.getEntry(data.sessionId, data.editableId);
				recoveryDialog.setEntry(currentry);
			}
		});

		let filterfunc = terafm.help.debounce(function(e) {
			let value = e.path[0].value,
				data = db.getSessions(),
				filterCount = 0;

			if(value.length) {
				data = data.filterEntries(function(entry) {
					if(entry.obj.value.indexOf(value) === -1) return null;
				});
				filterCount = sessionlist.countEntries() - data.countEntries();
			}

			recoveryDialog.populate(data, filterCount);
		}, 500);
		diagRootNode.querySelector('input[type=text]').addEventListener('input', filterfunc);
	}

	function remSel() {
		let cs = diagRootNode.querySelector('.session-data li.selected');
		if(cs) cs.classList.remove('selected');
	}

})(terafm.recoveryDialogController, terafm.recoveryDialog, terafm.db, terafm.help, terafm.editableManager, terafm.options, terafm.keyboardShortcuts, terafm.initHandler);