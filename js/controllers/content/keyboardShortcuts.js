window.terafm = window.terafm || {};

(function(db, editableManager, initHandler, options, keyboardShortcuts, toast) {
	'use strict';

	initHandler.onInit(function() {
		if(options.get('keybindEnabled')) {

			var keybindRestorePreviousSession = options.get('keybindRestorePreviousSession');

			if(keybindRestorePreviousSession.length) keyboardShortcuts.on(keybindRestorePreviousSession, function() {
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
			});

		}
	})

})(terafm.db, terafm.editableManager, terafm.initHandler, terafm.options, terafm.keyboardShortcuts, terafm.toast);