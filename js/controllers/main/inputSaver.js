(function(editableManager, db, saveIndicator, DOMEvents) {
	'use strict';

	DOMEvents.registerHandler('input', changeHandler);
	DOMEvents.registerHandler('keyup', function(e) {
		if(['www.facebook.com', 'www.messenger.com'].includes(window.location.host) && (e.keyCode == 8 || e.keyCode == 46 || e.keyCode === 13) ) {
			// console.log('facebook shim keyCode:', e.keyCode);
			changeHandler(e);
		}
	});
	DOMEvents.registerHandler('change', changeHandler);
	DOMEvents.registerHandler('click', function(e) {
		if(!editableManager.isEditableText(e.path[0])) {
			changeHandler(e);
		}
	});

	// Don't wanna debounce this beacause it'd prevent saving search
	// fields and similar if you submit before the timout ends
	// Also for chat apps
	function changeHandler(e) {

		let editable = editableManager.getEditable(e.path[0]),
			passRules = editable ? editableManager.checkRules(editable) : false;

		if(editable && passRules) {
			let value = editableManager.getEditableValue(editable),
				entry = editableManager.createEntryObject(editable, value),
				editableId = editableManager.generateEditableId(editable);

			if(entry) {
				let newSessId = editableManager.getEditableSessionId(editable);

				// Special care for radio inputs, have to delete siblings
				if(editable.type === 'radio') {
					editableManager.deleteRadioSiblingsFromStorage(editable);
				}

				// If empty value, remove
				if(editableManager.getEditableValue(editable, true).length < 1) {
					db.deleteSingleRevisionByEditable(editableId, newSessId);
				} else {
					db.saveRevision(editableId, entry, newSessId);
					// console.log('saving', entry);
				}
			}

		// Valid editable but did not pass rules
		} else if(editable && !passRules) {
			let editableId = editableManager.generateEditableId(editable),
				sessId = editableManager.getEditableSessionId(editable);

		 	db.deleteSingleRevisionByEditable(editableId, sessId);
		}
	}

})(terafm.editableManager, terafm.db, terafm.saveIndicator, terafm.DOMEvents);