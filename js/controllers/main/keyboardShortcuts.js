/*'use strict';

window.terafm = window.terafm || {};
terafm.keyboardShortcuts = (function() {

	this.setupKeyboardShortcuts = function() {

		Mousetrap.bindGlobal('ctrl+del', function(e) {

			var fields = terafm.db.getLatestSession(),
				totalCount = Object.keys(fields).length,
				fails = 0;

			if(totalCount < 1) {
				//terafm.toast.create('Nothing to restore.')
				return false;
			}

			for(var fieldId in fields) {
				var editable = fields[fieldId];
				var target = terafm.editableManager.getEditableByPath(editable.path, editable.frame);

				if(target) {
					terafm.editableManager.setEditableValue(target, editable.value);
					terafm.editableManager.flashEditable(target);
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
	}

})();*/