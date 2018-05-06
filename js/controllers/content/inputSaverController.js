(function(editableManager, db, saveIndicator, Events) {
	'use strict';

	terafm.initHandler.onInit(function() {

		// Force save before window is closed
		window.addEventListener('beforeunload', db.push);

		Events.on('input', e => changeHandler(e.path[0]));
		Events.on('change', e => changeHandler(e.path[0]));
		// Events.on('submit', e => changeHandler(e.path[0])); // Todo: Add? Test?

		// Hack for facebook messenger
		if(['www.facebook.com', 'www.messenger.com'].includes(window.location.host)) {
			Events.on('keyup', function(e) {
				if(e.keyCode == 8 || e.keyCode == 46 || e.keyCode === 13) changeHandler(e.path[0]);
			});
		}

		// Watch for subtree changes (for contenteditables)
		let observer = new MutationObserver(mutation => changeHandler(mutation[0].target));
		Events.on('focus', e => {
			observer.disconnect();

			const editable = terafm.EditableFactory(e.path[0]);
			if(editable && editable.isContentEditable()) {
				observer.observe(editable.el, {childList: true, subtree: true});
			}
		});
	})

	// Todo: Deal with empty values (chat apps?)
	function changeHandler(el) {

		if(terafm.pauseLogging) return;

		const editable = terafm.EditableFactory(el);
		console.log('change', editable);

		if(!editable) return;

		editable.touch();

		if(terafm.validator.validate(editable)) {
			editable.getEntry().save();

			if(editable.type === 'radio') deleteRadioSiblings(editable);

		// Did not validate, delete if exists (if value validation failed)
		} else {
			terafm.db.del(editable.sessionId, editable.id);
		}
	}

	function watchTree() {

	}


	
	function deleteRadioSiblings(editable) {
		if(editable.type === 'radio' && editable.el.name) {
			
			const radios = editable.el.getRootNode().querySelectorAll('input[type="radio"][name="'+ editable.el.name +'"]');
			console.log(radios)
			radios.forEach(function(rad) {
				if(rad !== editable.el) {
					let sib = new terafm.Editable(rad);
					db.del(editable.sessionId, sib.id);
				}
			});
		}
	}

})(terafm.editableManager, terafm.db, terafm.saveIndicator, terafm.Events);