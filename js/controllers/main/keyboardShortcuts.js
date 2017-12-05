window.terafm = window.terafm || {};
terafm.keyboardShortcuts = {};

(function(db, editableManager, recoveryDialog, recoveryDialogController, initHandler) {
	'use strict';

	initHandler.onInit(function() {

		Mousetrap.bindGlobal('ctrl+del', function(e) {

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

		});
	})

})(terafm.db, terafm.editableManager, terafm.recoveryDialog, terafm.recoveryDialogController, terafm.initHandler);