window.terafm = window.terafm || {};

terafm.recoveryDialogController = {};

(function(recoveryDialogController, recoveryDialog, db, help, editableManager, options, keyboardShortcuts, initHandler) {
	'use strict';
	
	let loadedData,
		selectedEntry,

		dialogNode;

	// Open call from context menu
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'openRecoveryDialog') recoveryDialogController.open();
	});


	// Key comobo to open/close diag
	initHandler.onInit(function() {
		if(options.get('keybindEnabled')) {
			keyboardShortcuts.on(options.get('keybindToggleRecDiag'), function() {
				if(recoveryDialog.isShowing()) {
					recoveryDialog.hide();
				} else {
					recoveryDialogController.open();
				}
			});
		}
	})

	recoveryDialogController.open = function() {
		terafm.quickAccessController.hide();

		setup(function() {
			loadedData = db.getAllSessions();
			console.log(loadedData)
			recoveryDialog.populate(loadedData);
			recoveryDialog.setPage('default');
			recoveryDialog.show();
		});
	}

	function repopulate() {
		recoveryDialog.populate(getRevisionData());
	}

	function getRevisionData() {
		// return {sessions: db.getAllSessions(), skipCount: 0};

		// let sessions = db.getAllRevisionsGroupedBySession(),
		// 	sessKeys = Object.keys(sessions),
		// 	currentSessionId = db.sessionId(),
		// 	hideSmallEntries = options.get('hideSmallEntries'),
		// 	skipCount = 0,
		// 	retObj = {};


		// for(let skey in sessKeys) {

		// 	// Delete if value is too short
		// 	for(let editableId in sessions[sessKeys[skey]]) {
		// 		var editable = sessions[sessKeys[skey]][editableId],
		// 			cleanValue = help.encodeEntry(editable);

		// 		if(cleanValue.length < 5) {
		// 			skipCount++;

		// 			if(hideSmallEntries) {
		// 				delete sessions[ sessKeys[skey] ][ editableId ];

		// 				// If last item in session, delete session from list to prevent empty <ul> tag
		// 				if(Object.keys(sessions[ sessKeys[skey] ]).length === 0) {
		// 					delete sessions[ sessKeys[skey] ];
		// 				}

		// 				// If empty, delete from database
		// 				if(cleanValue.length < 1) {
		// 					db.deleteSingleRevisionByEditable(editableId, sessKeys[skey]);
		// 				}
		// 			}
		// 		}
		// 	}
		// }

		// retObj = {
		// 	sessions: sessions,
		// 	skipCount: skipCount
		// };

		// return retObj;
	}

	function setup(callback) {
		if(dialogNode) return callback();
		recoveryDialog.build(function(node) {
			dialogNode = node;
			setupEventListeners();
			callback();
		});
	}

	function setupEventListeners() {

		keyboardShortcuts.on(['Escape'], function() {
			recoveryDialog.hide();
		})

		dialogNode.addEventListener('click', function(e) {

			var target = e.path[0];

			// Close dialogNode trigger
			if(target.classList.contains('trigger-close-dialog')) {
				recoveryDialog.hide();

			// Delete single entry trigger
 			} else if(target.dataset.deleteSingle !== undefined) {

 				if(target.classList.contains('confirm')) {
					var editable = target.dataset.editable,
						session = target.dataset.session;

					db.deleteSingleRevisionByEditable(editable, session);

					// Entry doesn't exist anymore, go back to default page
					recoveryDialog.setPage('default');

					var li = target.closest('li'),
						ul = li.parentElement;

					// Remove list item
					ul.removeChild(li);

					// If that was the last list item, remove UL
					if(ul.children.length < 1) {

						// If last list item in last UL, re-populate the whole list (will result in "no entries" message)
						if(ul.children.length === 0 && ul.parentElement.children.length === 1) {
							repopulate();

						// Remove empty ul (timestamp)
						} else {
							ul.parentElement.removeChild(ul);
						}

					}
 				} else {
 					target.classList.add('confirm');
 					target.innerHTML = 'Click again to delete';

 					setTimeout(function() {
 						if(target) {
 							target.classList.remove('confirm');
 							target.innerHTML = 'Delete entry';
 						}
 					}, 4000);
 				}


			// Set current revision
			} else if(target.dataset.setCurrent !== undefined || target.closest('[data-set-current]')) {
				
				if(target.dataset.setCurrent !== undefined) {
					var listItem = target;
				} else {
					var listItem = target.closest('[data-set-current]');
				}

				var currSelected = listItem.closest('.recovery-container').querySelector('.selected');
				if(currSelected) {
					currSelected.classList.remove('selected');
				}
				listItem.classList.add('selected');

				let revision = terafm.db.getSingleRevisionByEditableAndSession(listItem.dataset.editable, listItem.dataset.session);

				selectedRevision.editablePath = revision.path;
				selectedRevision.editableValue = revision.value;
				selectedRevision.session = listItem.dataset.session;

				recoveryDialog.setRevision(revision, listItem.dataset.editable, listItem.dataset.session);
				recoveryDialog.setPage('recover');
				recoveryDialog.animateContentPartial();


			// Recover single trigger
			} else if(target.classList.contains('trigger-recover-single')) {
				var target = editableManager.resolvePath(selectedRevision.editablePath);
				if(target) {
					editableManager.setEditableValue(target, selectedRevision.editableValue);
					terafm.editableManager.flashEditable(target);
					recoveryDialog.hide();
				} else {
					alert('Target input cannot be found, please copy the the text manually.');
				}


			// Recover session trigger
			} else if(target.classList.contains('trigger-recover-session')) {
				var session = db.getRevisionsBySession(selectedRevision.session),
					fails = 0;
					
				session.forEach(function(editable) {
					var target = terafm.editableManager.resolvePath(editable.path);
					if(target) {
						editableManager.setEditableValue(target, editable.value);
						terafm.editableManager.flashEditable(target);
					} else {
						fails += 1;
					}
				});

				if(fails !== 0) {
					alert(fails + ' out of '+ session.length +' fields could not be restored because their original input elements does not exist anymore. You can restore the fields manually with the Copy button.');
				}

				recoveryDialog.hide();
			

			// Set page trigger
			} else if(target.dataset.setPage !== undefined) {
				recoveryDialog.setPage(target.dataset.setPage);


			// Open extension settings trigger
			} else if(target.classList.contains('trigger-open-extension-settings')) {
				chrome.runtime.sendMessage({action: 'openSettings'});


			// Delete all revisions trigger
			} else if(target.classList.contains('trigger-delete-all')) {
				db.deleteAllSessions();
				repopulate();


			// Copy to clipboard trigger
			} else if(target.classList.contains('trigger-copy')) {
				document.body.insertAdjacentHTML('afterbegin', '<textarea id="terafm-copy" style="position: absolute;"></textarea>');
				var copyCont = document.querySelector('#terafm-copy');

				copyCont.value = selectedRevision.editableValue;
				copyCont.select();

				document.execCommand('copy');
				document.body.removeChild(copyCont);

				recoveryDialog.hide();
				terafm.toast.create('Text copied to clipboard')

			// Add site to blacklist trigger
			} else if(target.dataset.action === 'add-to-blacklist') {
				terafm.blacklist.block(window.location.hostname)
				target.parentElement.insertAdjacentHTML('afterbegin', '<p>Typio will be disabled on the next page load.</p>');
				target.parentElement.removeChild(target);

			} else if(target.classList.contains('toggleHideSmallEntries')) {
				let value = target.checked === true ? 1 : 0;
				options.set('hideSmallEntries', value);
				repopulate();

			// Todo: Make global handler
			} else if(target.dataset.action === 'show-shortcuts') {
				recoveryDialog.hide();
				terafm.keyboardShortcutController.showShortcutDialog();
			}

		});
	}
})(terafm.recoveryDialogController, terafm.recoveryDialog, terafm.db, terafm.help, terafm.editableManager, terafm.options, terafm.keyboardShortcuts, terafm.initHandler);