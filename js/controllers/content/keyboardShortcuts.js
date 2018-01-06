window.terafm = window.terafm || {};
terafm.keyboardShortcuts = {};

(function(db, editableManager, recoveryDialog, recoveryDialogController, contextMenu, initHandler, DOMEvents) {
	'use strict';

	initHandler.onInit(function() {

		DOMEvents.registerHandler('keydown', function(e) {


			if(e.key === 'Delete' && e.ctrlKey === true) {

				// Open dialog
				if(!recoveryDialog.isShowing()) {
					recoveryDialogController.open();
					

				// Restore latest sess
				} else {

					var fields = db.getLatestSession(),
						totalCount = Object.keys(fields).length,
						fails = 0;

					if(totalCount < 1) {
						return false;
					}

					for(var fieldId in fields) {
						var editable = fields[fieldId];
						var target = editableManager.resolvePath(editable.path);

						if(target) {
							editableManager.setEditableValue(target, editable.value);
							editableManager.flashEditable(target);
						} else {
							fails++;
						}
					}

					recoveryDialog.hide();
				}


			} else if(e.key === 'Escape') {
				recoveryDialog.hide();
				contextMenu.hide();
			}
		})
	})

})(terafm.db, terafm.editableManager, terafm.recoveryDialog, terafm.recoveryDialogController, terafm.contextMenu, terafm.initHandler, terafm.DOMEvents);