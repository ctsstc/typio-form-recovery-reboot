(function(editableManager, db, saveIndicator, DOMEvents) {
	'use strict';

	DOMEvents.registerHandler('input', changeHandler);
	DOMEvents.registerHandler('change', changeHandler);

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
				let newSessId = editableManager.getEditableSessionId(editable);

				// If empty value, remove
				if(editableManager.getEditableValue(editable, true).length < 1) {
					db.deleteSingleRevisionByEditable(editableId, newSessId);
				} else {
					db.saveRevision(editableId, entry, newSessId);
				}
			}
		}
	}

})(terafm.editableManager, terafm.db, terafm.saveIndicator, terafm.DOMEvents);