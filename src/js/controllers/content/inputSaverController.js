import db from '../../modules/db/db'
import Editable from '../../classes/Editable';
import Events from '../../modules/Events';
import Editables from '../../modules/Editables';
import initHandler from '../../modules/initHandler';
import validator from '../../modules/validator';
import EditableDefaults from '../../modules/EditableDefaults';


initHandler.onInit(function() {

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

		const editable = Editables.get(e.path[0]);
		if(editable && editable.isContentEditable()) {
			observer.observe(editable.el, {childList: true, subtree: true});
		}
	});
})

function changeHandler(el) {
	if(window.terafm.pauseLogging) return;

	const editable = Editables.get(el);

	if(!editable) return;

	editable.touch();

	if(validator.validate(editable)) {
		let entry = editable.getEntry();
		EditableDefaults.update(editable);

		if(false === editable.isEmpty()) db.saveEntry(entry);
		if(editable.type === 'radio') deleteRadioSiblings(editable);

	// Did not validate, delete if exists (if value validation failed)
	} else {
		db.deleteEntry(editable.sessionId, editable.id);
	}
}



function deleteRadioSiblings(editable) {
	if(editable.type === 'radio' && editable.el.name) {
		
		const radios = editable.el.getRootNode().querySelectorAll('input[type="radio"][name="'+ editable.el.name +'"]');
		radios.forEach(function(rad) {
			if(rad !== editable.el) {
				let sib = new Editable(rad);
				db.deleteEntry(editable.sessionId, sib.id);
			}
		});
	}
}
