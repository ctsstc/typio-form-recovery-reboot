window.terafm = window.terafm || {};

(function(db, editableManager, recoveryDialog, recoveryDialogController, contextMenu, initHandler, options, keyboardShortcuts) {
	'use strict';

	initHandler.onInit(function() {

		var keybindToggleRecDiag = options.get('keybindToggleRecDiag'),
			keybindRestorePreviousSession = options.get('keybindRestorePreviousSession')

		keyboardShortcuts.on(keybindToggleRecDiag, function() {
			if(recoveryDialog.isShowing()) {
				recoveryDialog.hide();
			} else {
				recoveryDialogController.open();
			}
		})

		keyboardShortcuts.on(keybindRestorePreviousSession, function() {
			console.log('yay!! restoring last session.')

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
		})

		keyboardShortcuts.on(['Escape'], function() {
			recoveryDialog.hide();
			contextMenu.hide();
		})
	})

})(terafm.db, terafm.editableManager, terafm.recoveryDialog, terafm.recoveryDialogController, terafm.contextMenu, terafm.initHandler, terafm.options, terafm.keyboardShortcuts);