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

				remSel();
				target.classList.add('selected');
				let data = target.dataset;
				currentry = sessionlist.getEntry(data.sessionId, data.editableId);
				recoveryDialog.setEntry(currentry);
			}
		});

		// diagRootNode.querySelector('input[type=text]').addEventListener('input', function(e) {
		// 	console.log(e);
		// 	let copy = sessionlist.filterEntries(function(entry) {
		// 		console.log('filterin', entry);
		// 		return entry;
		// 	});
		// 	console.log('original', sessionlist)
		// 	console.log('filtered', copy)
		// });

		diagRootNode.querySelector('input[type=text]').addEventListener('input', function(e) {
			let s = e.target.value;

			let copy = db.getAllSessions().filterEntries(function(entry) {
				if(entry.obj.value.indexOf(s) === -1) return null;
			});

			let filterCount = sessionlist.countEntries() - copy.countEntries();

			recoveryDialog.populate(copy, filterCount);
		});
	}

	function remSel() {
		let cs = diagRootNode.querySelector('.session-data li.selected');
		if(cs) cs.classList.remove('selected');
	}

})(terafm.recoveryDialogController, terafm.recoveryDialog, terafm.db, terafm.help, terafm.editableManager, terafm.options, terafm.keyboardShortcuts, terafm.initHandler);