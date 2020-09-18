import Events from '../../modules/Events';
import initHandler from '../../modules/initHandler';
import Editables from '../../modules/Editables';

let target,
	focusTimeout;

initHandler.onInit(function() {

	// Autofocus support
	setTimeout(function() {
		Events.trigger('focus', {path: [document.activeElement]});
	}, 100)
});


// Empty setTimeouts are used to make sure focus is always called after
// blur on another input. This works by default but bubbling fake events
// from encapsulators is slightly slower and causes the events to fire
// out of order. This fixes the issue.

Events.on('focus', function(e) {
	clearTimeout(focusTimeout)
	focusTimeout = setTimeout(function() {
		target = e.path[0];
		const editable = Editables.getTextEditable(e.path[0]);
		window.terafm.focusedEditable = editable;
		if(editable) {
			Events.trigger('editable-text-focus', null)
			window.terafm.lastFocusedEditable = editable;
		}
	})
});

// Click is fallback to "focus" because shadow dom is being a dick and
// will only bubble the first time. Tabbing still does not work correctly.
// Also needed on pimcore login (among others) for focus issues.
Events.on('click', function(e) {

	// If focus has taken care of it, do nothing
	if(e.path[0] !== target) {
		var editable = Editables.getTextEditable(e.path[0]);

		target = e.path[0];

		if(editable && !editable.is(terafm.focusedEditable)) {
			clearTimeout(focusTimeout)
			focusTimeout = setTimeout(function() {
				terafm.focusedEditable = editable;
				Events.trigger('editable-text-focus', null);
			})
		}
	}
})

Events.on('blur', function() {
	window.terafm.focusedEditable = null;
})

