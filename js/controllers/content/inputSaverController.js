(function(editableManager, db, saveIndicator, DOMEvents) {
	'use strict';

	terafm.initHandler.onInit(function() {

		// Force save before window is closed
		window.addEventListener('beforeunload', db.sync);

		DOMEvents.registerHandler('input', changeHandler);
		DOMEvents.registerHandler('change', changeHandler);

		// Hack for facebook messenger
		if(['www.facebook.com', 'www.messenger.com'].includes(window.location.host)) {
			DOMEvents.registerHandler('keyup', function(e) {
				if(e.keyCode == 8 || e.keyCode == 46 || e.keyCode === 13) changeHandler(e);
			});
		}
	})

	function changeHandler(e) {

		let editable = terafm.EditableFactory(e.path[0]);


		// if(editable) {
		console.log(editable);
		// }

		/*
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

				// console.log('saving')

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
		*/
	}

})(terafm.editableManager, terafm.db, terafm.saveIndicator, terafm.DOMEvents);