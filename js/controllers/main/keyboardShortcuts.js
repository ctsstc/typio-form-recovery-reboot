window.terafm = window.terafm || {};
terafm.keyboardShortcuts = {};

(function(keyboardShortcuts, db, editableManager) {
	'use strict';

	terafm.init(function() {

		Mousetrap.bindGlobal('ctrl+del', function(e) {
			console.log('restoring');

			var fields = db.getLatestSession(),
				totalCount = Object.keys(fields).length,
				fails = 0;

			if(totalCount < 1) {
				//terafm.toast.create('Nothing to restore.')
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

			if(fails === 0) {
				//terafm.toast.create('Recovered previous session.');
			} else {
				//terafm.toast.create(fails + ' previous entries could not be restored automatically. Open form recovery to restore fields manually.', 10*1000);
			}

		});
	})

})(terafm.keyboardShortcuts, terafm.db, terafm.editableManager);