(function(editableManager, db, saveIndicator) {
	'use strict';

	document.addEventListener('change', changeHandler);
	document.addEventListener('keyup', changeHandler);

	// Don't wanna debounce this beacause it'd prevent saving search
	// fields and similar if you submit before the timout ends
	function changeHandler(e) {

		let editable = editableManager.getEditable(e.path[0]);

		if(editable) {
			let value = editableManager.getEditableValue(editable),
				entry = editableManager.createEntryObject(editable, value),
				editableId = editableManager.generateEditableId(editable);


			if(entry) {
				db.saveRevision(editableId, entry);
				//saveIndicator.pulse();
			}
		}
	}

})(terafm.editableManager, terafm.db, terafm.saveIndicator);