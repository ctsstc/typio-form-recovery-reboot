window.terafm = window.terafm || {};

(function(db, editableManager, recoveryDialog, recoveryDialogController, contextMenu, initHandler, options, keyboardShortcuts, toast) {
	'use strict';

	initHandler.onInit(function() {

		keyboardShortcuts.on(['Escape'], function() {
			recoveryDialog.hide();
			contextMenu.hide();
		})

		var enabled = options.get('keybindEnabled');

		if(enabled) {

			var keybindToggleRecDiag = options.get('keybindToggleRecDiag'),
				keybindRestorePreviousSession = options.get('keybindRestorePreviousSession')

			if(keybindToggleRecDiag.length) {
				keyboardShortcuts.on(keybindToggleRecDiag, function() {
					if(recoveryDialog.isShowing()) {
						recoveryDialog.hide();
					} else {
						recoveryDialogController.open();
					}
				})
			}

			if(keybindRestorePreviousSession.length) {
				keyboardShortcuts.on(keybindRestorePreviousSession, function() {

					toast.create('Restoring previous session')
					
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
			}

		}
	})

})(terafm.db, terafm.editableManager, terafm.recoveryDialog, terafm.recoveryDialogController, terafm.contextMenu, terafm.initHandler, terafm.options, terafm.keyboardShortcuts, terafm.toast);