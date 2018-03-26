(function(editableManager, db, saveIndicator, DOMEvents) {
	'use strict';

	terafm.initHandler.onInit(function() {

		// Force save before window is closed
		window.addEventListener('beforeunload', db.push);

		DOMEvents.registerHandler('input', changeHandler);
		DOMEvents.registerHandler('change', changeHandler);

		// Hack for facebook messenger
		if(['www.facebook.com', 'www.messenger.com'].includes(window.location.host)) {
			DOMEvents.registerHandler('keyup', function(e) {
				if(e.keyCode == 8 || e.keyCode == 46 || e.keyCode === 13) changeHandler(e);
			});
		}
	})

	// Todo: Deal with empty values (chat apps?)
	function changeHandler(e) {

		const editable = terafm.EditableFactory(e.path[0]);

		if(!editable) return;

		editable.touch();

		if(terafm.validator.validate(editable)) {
			editable.getEntry().save();

			if(editable.type === 'radio') deleteRadioSiblings(editable);

		// Did not validate, delete if exists (if value validation failed)
		} else {
			terafm.db.del(editable.sessionId, editable.id)
		}
	}


	
	function deleteRadioSiblings(editable) {
		if(editable.type === 'radio' && editable.el.name) {
			
			const radios = editable.el.getRootNode().querySelectorAll('input[type="radio"][name="'+ editable.el.name +'"]');
			
			radios.forEach(function(rad) {
				if(rad !== editable.el) {
					let sib = new terafm.Editable(rad);
					db.del(editable.getSessionId(), sib.id);
				}
			});
		}
	}

})(terafm.editableManager, terafm.db, terafm.saveIndicator, terafm.DOMEvents);