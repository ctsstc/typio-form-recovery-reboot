(function(editableManager, db) {
	'use strict';

	// Watch for change/keyup/click events

		// Check if target is editable

			// Check if value is good to save

				// Save

	document.addEventListener('change', documentChangeHandler);
	document.addEventListener('keyup', documentChangeHandler);

	// Don't wanna debounce this beacause it'd prevent saving search
	// fields and similar if you submit before the timout ends
	function documentChangeHandler(e) {

		var editable = editableManager.getEditable(e.path[0]);
		if(editable) {
			var value = editableManager.getEditableValue(editable);

			var entry = editableManager.createEntryObject(editable, value);

			if(entry) {
				console.log('entry', entry);
				db.saveRevision(entry);
			}
		}
	}

})(terafm.editableManager, terafm.db);