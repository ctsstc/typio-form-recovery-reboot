(function(editableManager, db, saveIndicator, Events) {
	'use strict';

	terafm.initHandler.onInit(function() {

		// Force save before window is closed
		window.addEventListener('beforeunload', db.push);

		Events.on('input', e => changeHandler(e.path[0]));
		Events.on('change', e => changeHandler(e.path[0]));

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

			const editable = terafm.editables.get(e.path[0]);
			if(editable && editable.isContentEditable()) {
				observer.observe(editable.el, {childList: true, subtree: true});
			}
		});
	})

	function changeHandler(el) {

		if(terafm.pauseLogging) return;

		const editable = terafm.editables.get(el);

		if(!editable) return;

		editable.touch();

		if(terafm.validator.validate(editable)) {
			let entry = editable.getEntry();
			terafm.defaults.update(editable);

			if(entry.obj.value.length > 0) entry.save();
			if(editable.type === 'radio') deleteRadioSiblings(editable);

		// Did not validate, delete if exists (if value validation failed)
		} else {
			terafm.db.del(editable.sessionId, editable.id);
		}
	}


	
	function deleteRadioSiblings(editable) {
		if(editable.type === 'radio' && editable.el.name) {
			
			const radios = editable.el.getRootNode().querySelectorAll('input[type="radio"][name="'+ editable.el.name +'"]');
			radios.forEach(function(rad) {
				if(rad !== editable.el) {
					let sib = new terafm.Editable(rad);
					db.del(editable.sessionId, sib.id);
				}
			});
		}
	}

})(terafm.editableManager, terafm.db, terafm.saveIndicator, terafm.Events);