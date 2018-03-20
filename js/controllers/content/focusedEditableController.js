window.terafm = window.terafm || {};

(function(DOMEvents, editableManager) {
	var target;

	DOMEvents.registerHandler('focus', function(e) {
		target = e.path[0];
		terafm.focusedEditable = editableManager.getEditableText(e.path[0]);
	});

	// Click is fallback to "focus" because shadow dom is being a dick and
	// will only bubble the first time. Tabbing still does not work correctly.
	DOMEvents.registerHandler('click', function(e) {

		// If focus has taken care of it, do nothing
		if(e.path[0] !== target) {
			var editable = editableManager.getEditableText(e.path[0]);

			target = e.path[0];
			
			if(editable && editable !== terafm.focusedEditable) {
				terafm.focusedEditable = editable;
				DOMEvents.trigger('focus-fallback', null);
			}
		}
	})

	DOMEvents.registerHandler('blur', function() {
		console.log('blur')
		terafm.focusedEditable = null;
	})

})(terafm.DOMEvents, terafm.editableManager);