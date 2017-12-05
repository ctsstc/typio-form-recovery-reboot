window.terafm = window.terafm || {};
terafm.editableManager = terafm.editableManager || {};

(function(editableManager, help, db, cache, options) {
	'use strict';


	function isElement(elem) {
		// Check if element has parent document and window
		if(elem.ownerDocument && elem.ownerDocument.defaultView) {

			// Check if it's of type HTMLElement from parent window
			if(elem instanceof elem.ownerDocument.defaultView.HTMLElement) {
				return true;
			}
		}

		return false;
	}


	// Takes editablePath or editable dom node
	editableManager.generateEditableId = function(editable) {
		let edPath = editable.tagName ? editableManager.genPath(editable) : editable;

		return terafm.cache(edPath, function() {
			return 'field' + terafm.help.hashStr(edPath);
		});
	}

	editableManager.createEntryObject = function(editable, value) {

		let editablePath = editableManager.genPath(editable),
			typeData = getEditableType(editable),
			data = {};

		data = {
			value: value,
			path: editablePath,
			...typeData // Append values
		}

		return data;
	}

	function getEditableType(editable) {

		// Is input(various text types) or textarea or contenteditable
		if(editableManager.isEditableText(editable)) {
			return {
				type: editable.type ? editable.type : 'contenteditable'
			};

		// Checkbox or radio
		} else if(editable.type && ['checkbox', 'radio'].includes(editable.type) ) {
			return {
				type: editable.type,
				meta: editable.name + ': ' + editable.value,
			};

		// All other input types (select, range, color, date etc)
		} else if(editable.type) {
			return {
				type: editable.type,
				meta: editable.name
			};
		}
	}

	editableManager.getEditableSessionId = function(editable) {

		// Text inputs can get a new session if inputs are cleared
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
			return editable.terafmSessId;
		}
	}
	
	// Radios require special attention, this is ugly but it'll do for now
	// Todo: Fix
	editableManager.deleteRadioSiblingsFromStorage = function(input) {
		if(input.type == 'radio' && input.name) {
			
			var siblingRadios = input.getRootNode().querySelectorAll('input[type="radio"][name="'+ input.name +'"]');
			
			siblingRadios.forEach(function(sib) {
				if(sib !== input) {
					var sibId = editableManager.generateEditableId(sib);

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

		// Elem must be a valid html element
		if(!isElement(elem)) return false;

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
		if(!isElement(elem)) return false;

		if( options.get('textEditableTypes').includes(elem.type) || elem.getAttribute('contenteditable') == 'true' || elem.nodeName == 'TEXTAREA' ) {
			return true;
		}
		return false;
	}

	editableManager.isContentEditable = function(elem) {
		return elem.contentEditable === 'true';
	}
	
	// Check if element is editable OR is within a contenteditable parent
	editableManager.getEditable = function(elem) {
		if(!isElement(elem)) return false;

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


		if(typeof value === 'string') {
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

})(terafm.editableManager, terafm.help, terafm.db, terafm.cache, terafm.options);