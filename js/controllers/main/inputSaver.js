(function(editableManager, db, saveIndicator) {
	'use strict';

	terafm.registerHandler('input', changeHandler);
	terafm.registerHandler('change', changeHandler);

	// Don't wanna debounce this beacause it'd prevent saving search
	// fields and similar if you submit before the timout ends
	// Also for chat apps
	function changeHandler(e) {

		let editable = editableManager.getEditable(e.path[0]);

		if(editable) {
			let value = editableManager.getEditableValue(editable),
				entry = editableManager.createEntryObject(editable, value),
				editableId = editableManager.generateEditableId(editable);

			// console.log('saving', editableId, editable);

			if(entry) {
				let edSessId = editableManager.getEditableSessionId(editable);
				db.saveRevision(editableId, entry, edSessId);
			}
		}
	}

})(terafm.editableManager, terafm.db, terafm.saveIndicator);