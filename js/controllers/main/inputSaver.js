(function(editableManager, db, saveIndicator) {
	'use strict';

	terafm.registerHandler('change', changeHandler);
	terafm.registerHandler('keyup', changeHandler);

	// Don't wanna debounce this beacause it'd prevent saving search
	// fields and similar if you submit before the timout ends
	function changeHandler(e) {
		// console.log('changeHandler', e);

		let editable = editableManager.getEditable(e.path[0]);

		if(editable) {
			let value = editableManager.getEditableValue(editable),
				entry = editableManager.createEntryObject(editable, value),
				editableId = editableManager.generateEditableId(editable);

			console.log('saving', editableId, editable);

			if(entry) {
				db.saveRevision(editableId, entry);
			}
		}
	}

})(terafm.editableManager, terafm.db, terafm.saveIndicator);