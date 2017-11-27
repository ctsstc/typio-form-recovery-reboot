window.terafm = window.terafm || {};
terafm.editableManager = terafm.editableManager || {};

(function(editableManager, help, db, cache) {
	'use strict';

	/*
	// Takes editablePath or editable dom node
	editableManager.generateEditableId = function(editable) {

		// If dom node
		if(editable instanceof HTMLElement) {

			// Return if cached
			if('terafmId' in editable) return editable.terafmId;

			let edId, edPath = editableManager.genPath(editable);

			// Create id and cache it
			edId = 'field' + terafm.help.hashStr(edPath);
			editable.dataset.terafmId = edId;
			return edId;

		// It's a path, can't cache on that
		} else {
			console.warn('generateEditableId was called with a path, cannot be cached.', editable);
			return 'field' + terafm.help.hashStr(editable);
	*/
	// Takes editablePath or editable dom node
	editableManager.generateEditableId = function(editable) {
		let edPath = editable.tagName ? editableManager.genPath(editable) : editable;

		return terafm.cache(edPath, function() {
			return 'field' + terafm.help.hashStr(edPath);
		});
	}




	editableManager.createEntryObject = function(editable, value) {

		// let editablePath = cache({'path': editable}, function() {
		// 	return terafm.editableManager.genPath(editable) || 'global:' + Math.round(Math.random()*10000000);
		// });
		let editablePath = terafm.editableManager.genPath(editable);

		// console.log('p', editablePath)
		// Delete entry if value is too short
		// Don't bother removing HTML here, it's too expensive
		// Todo: Detect major change (e.g. automatic value reset by script) and save long value (new session?)
		// Todo: Important! Below two blocks cannot run in encapsulated states due to lack of db, this should be moved into a better more descriptive place
		// if(value.length < 1) {
		// 	var editableId = editableManager.generateEditableId(editable);
		// 	terafm.db.deleteSingleRevisionByEditable(editableId);
		// 	return false;
		// }

		// // Special care for radio inputs, have to delete siblings
		// if(editable.type === 'radio') {
		// 	console.log('doing radio stuff');
		// 	editableManager.deleteRadioSiblingsFromStorage(editable);
		// }

		var data = {
			value: value,
			path: editablePath
		}
		return data;
	}

	editableManager.getEditableSessionId = function(editable) {
		if(editableManager.isEditableText(editable)) {
			let currLen = editableManager.getEditableValue(editable, true).length,
				oldLen = editable.terafmLength;

			// Set length property
			if(currLen > 0) {
				editable.terafmLength = currLen;
			}

			// If input was cleared, set new ID
			if(oldLen > 1 && currLen === 0) {
				editable.terafmSessId = db.generateSessionId();
			}

			// Default to global sess id
			// console.log(editable.terafmSessId || db.sessionId())
			return editable.terafmSessId || db.sessionId();
		}
	}
	
	// Radios require special attention, this is ugly but it'll do for now
	// Todo: Fix
	editableManager.deleteRadioSiblingsFromStorage = function(input) {
		if(input.type == 'radio' && input.name) {
			var siblingRadios = document.querySelectorAll('input[type="radio"][name="'+ input.name +'"]');
			siblingRadios.forEach(function(sib) {
				if(sib !== input) {
					var sibPath = editableManager.genPath(sib),
						sibId = editableManager.generateEditableId(input);
					// Delete current sibling revision
					db.deleteSingleRevisionByEditable(sibId);
				}
			});
		}
	}


	// Check if element is editable
	// In case of contenteditable it does NOT check if element is within
	// a contenteditable field.
	editableManager.isEditable = function(elem) {
		if(!elem) return false;

		// Check if input with valid type
		if(elem.nodeName == 'INPUT' && terafm.options.get('editableTypes').includes(elem.type)) {

			// Is it a password field?
			if(elem.type == 'password' && terafm.options.get('savePasswords') !== true) {
				return false;
			}

			return true;

		// Check if textarea
		} else if(elem.nodeName == 'TEXTAREA') {
			return true;

		} else if(elem.nodeName == 'SELECT') {
			return true;

		// Check if contenteditable
		} else if(elem.getAttribute('contenteditable') == 'true') {
			return true;
		}

		// Nah, fuck off mate-o
		return false;
	}

	editableManager.isEditableText = function(elem) {

		if( terafm.options.get('textEditableTypes').includes(elem.type) || elem.getAttribute('contenteditable') == 'true' || elem.nodeName == 'TEXTAREA' ) {
			return true;
		}
		return false;
	}
	
	// Check if element is editable OR is within a contenteditable parent
	editableManager.getEditable = function(elem) {
		if(!elem) return false;
		if(editableManager.isEditable(elem)) return elem;

		// Should never happen because input event returns parent contenteditable, but keep just in case
		// Iterate every parent, return if parent is editable
		var parent = elem.closest('[contenteditable]');
		if(parent !== null) {
			return parent;
		}

		return false;
	}

	editableManager.getEditableValue = function(editable, trim) {
		let value;

		if(editable.nodeName == 'INPUT' || editable.nodeName == 'TEXTAREA' || editable.nodeName === 'SELECT') {

			// Special care for checkable inputs
			if(editable.type === 'checkbox' || editable.type === 'radio') {
				value = editable.checked ? 1 : 0;

			} else {
				value = editable.value;
			}

		// Contenteditable
		} else {
			if(trim) {
				value = editable.textContent;
			} else {
				value = editable.innerHTML;
			}
		}


		if(trim) {
			return value.trim();
		}

		return value;
	}


	editableManager.setEditableValue = function(editable, val) {
		if(editable.nodeName == 'INPUT' || editable.nodeName == 'TEXTAREA') {

			// Special care for checkable inputs
			if(editable.type === 'checkbox') {
				val = parseInt(val);
				editable.checked = val ? true : false;

			} else if(editable.type === 'radio') {

				// Set by value
				if(val == parseInt(val)) {
					editable.checked = true;

				// Set by path
				} else {
					var orgRadio = document.querySelector(val);
					if(orgRadio) {
						orgRadio.checked = true;
					}
				}

			} else {
				editable.value = val;
			}

		} else if(editable.nodeName == 'SELECT') {
			editable.value = val;

		} else {
			editable.innerHTML = val;
		}
	}

})(terafm.editableManager, terafm.help, terafm.db, terafm.cache);