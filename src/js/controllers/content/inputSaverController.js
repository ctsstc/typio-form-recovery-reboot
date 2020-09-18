import db from '../../modules/db/db'
import Editable from '../../classes/Editable';
import Events from '../../modules/Events';
import Editables from '../../modules/Editables';
import initHandler from '../../modules/initHandler';
import validator from '../../modules/validator';
import EditableDefaults from '../../modules/EditableDefaults';

const elementsWithInputEventSupport = new Set();

initHandler.onInit(function() {

	// Force save before window is closed
	window.addEventListener('beforeunload', db.push);

	Events.on('keydown', e => changeHandler(e.path[0], 'keydown'));
	Events.on('input', e => changeHandler(e.path[0], 'input'));
	Events.on('change', e => changeHandler(e.path[0], 'change'));

	// Watch for subtree changes (for contenteditables)
	let observer = new MutationObserver(mutation => changeHandler(mutation[0].target, 'childMutation'));
	Events.on('focus', e => {
		observer.disconnect();

		const editable = Editables.get(e.path[0]);
		if(editable && editable.isContentEditable()) {
			observer.observe(editable.el, {childList: true, subtree: true});
		}
	});
})

function changeHandler(el, changeEvent) {
	if(window.terafm.pauseLogging) return;

	// Some editors (like Slate) cancel the input event, so we use keydown to capture input
	// for those instead. Because input has some advantages over keydown, we want to use
	// that if possible. Keydown fires before input, so for inputs that support both events
	// (most) the first keystroke will both input and keydown the first time.
	if(elementsWithInputEventSupport.has(el) && changeEvent === 'keydown') return;
	if(changeEvent === 'input' && !elementsWithInputEventSupport.has(el)) elementsWithInputEventSupport.add(el);

	const editable = Editables.get(el);

	if(!editable) return;

	// Radios and checkboxes will be saved twice due to the change and input
	// events, but we only need to save them once.
	if(changeEvent !== 'change' && ['radio', 'checkbox'].includes(editable.el.type)) return false;

	editable.touch();

	if(validator.validate(editable)) {
		let entry = editable.getEntry();
		EditableDefaults.update(editable);

		if(editable.type === 'radio') {
			deleteRadioSiblings(editable, () => {
				db.saveEntry(entry);
			});

		} else if(editable.isEmpty() === false) {
			db.saveEntry(entry);
		}


	// Did not validate, delete if exists (if value validation failed)
	} else {
		db.deleteEntry(editable.sessionId, editable.id);
	}
}


function deleteRadioSiblings(editable, callback) {
	const radios = editable.el.getRootNode().querySelectorAll('input[type="radio"][name="'+ editable.el.name +'"]');

	let entriesToDelete = [];
	for(const radio of radios) {
		if(radio !== editable.el) {
			let sib = new Editable(radio);
			entriesToDelete.push([editable.sessionId, sib.id])
		}
	}

	db.deleteEntries(entriesToDelete, callback);
}