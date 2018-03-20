window.terafm = window.terafm || {};

(function(DOMEvents, initHandler, editableManager) {
	"use strict";
	
	var target,
		focusTimeout;

	initHandler.onInit(function() {

		// Autofocus support
		setTimeout(function() {
			DOMEvents.trigger('focus', {path: [document.activeElement]});
		}, 100)
	});


	// Empty setTimeouts are used to make sure focus is always called after
	// blur on another input. This works by default but bubbling fake events
	// from encapsulators is slightly slower and causes the events to fire
	// out of order. This fixes the issue.

	DOMEvents.registerHandler('focus', function(e) {
		clearTimeout(focusTimeout)
		focusTimeout = setTimeout(function() {
			target = e.path[0];
			terafm.focusedEditable = editableManager.getEditableText(e.path[0]);
			DOMEvents.trigger('editable-text-focus', null)
		})
	});

	// Click is fallback to "focus" because shadow dom is being a dick and
	// will only bubble the first time. Tabbing still does not work correctly.
	DOMEvents.registerHandler('click', function(e) {

		// If focus has taken care of it, do nothing
		if(e.path[0] !== target) {
			var editable = editableManager.getEditableText(e.path[0]);

			target = e.path[0];
			
			if(editable && editable !== terafm.focusedEditable) {
				clearTimeout(focusTimeout)
				focusTimeout = setTimeout(function() {
					terafm.focusedEditable = editable;
					DOMEvents.trigger('editable-text-focus', null);
				})
			}
		}
	})

	DOMEvents.registerHandler('blur', function() {
		terafm.focusedEditable = null;
	})

})(terafm.DOMEvents, terafm.initHandler, terafm.editableManager);