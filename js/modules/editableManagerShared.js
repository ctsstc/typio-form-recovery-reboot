window.terafm = window.terafm || {};
terafm.editableManager = terafm.editableManager || {};

(function(editableManager, db, help) {
	'use strict';

	editableManager.createEntryObject = function(editable, value) {

		var editablePath = editable.dataset.terafmPath;

		// Not cached
		if(!editablePath) {

			editablePath = terafm.editableManager.genPath(editable);

			// Cannot generate path, assign random id
			if(!editablePath) {
				editablePath = 'global:' + Math.round(Math.random()*10000000);
			}

			// Cache in dataset
			editable.dataset.terafmPath = editablePath;
		}


		// Delete entry if value is too short
		// Don't bother removing HTML here, it's too expensive
		// Todo: Detect major change (e.g. automatic value reset by script) and save long value (new session?)
		if(value.length < 1) {
			var editableId = editableManager.generateEditableId(editable);
			terafm.db.deleteSingleRevisionByEditable(editableId);
			return false;
		}

		// Special care for radio inputs, have to delete siblings
		if(editable.type === 'radio') {
			console.log('doing radio stuff');
			editableManager.deleteRadioSiblingsFromStorage(editable);
		}

		var data = {
			value: value,
			path: editablePath
		}
		return data;
	}
	
	// Radios require special attention, this is ugly but it'll do for now
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
		if(editableManager.isEditable(elem)) return elem;

		// Iterate every parent, return if parent is editable
		//return parentElem(elem, function(elem) { return elem.getAttribute('contenteditable') == 'true' });
		var parent = elem.closest('[contenteditable]');
		if(parent !== null) {
			return parent;
		}

		return false;
	}


	editableManager.getEditableValue = function(editable) {
		if(editable.nodeName == 'INPUT' || editable.nodeName == 'TEXTAREA') {

			// Special care for checkable inputs
			if(editable.type === 'checkbox' || editable.type === 'radio') {
				return editable.checked ? 1 : 0;

			} else {
				return editable.value;
			}

		} else if(editable.nodeName === 'SELECT') {
			return editable.value;
		}
		return editable.innerHTML;
	}



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
		}
	}

	// See here for possible improvements:
	// https://stackoverflow.com/questions/5728558/get-the-dom-path-of-the-clicked-a
	// Careful cause changing this will result in editableID's changing
	// which results in entries not being shown in context menu
	// Todo: Break through iframes
	//function GET_PATH_BACKUP(el) {
	editableManager.genPathOLD = function(el) {

		// Check easy way first, does elem have a valid id?
		if(el.id && el.id.match(/^[a-z0-9._-]+$/i) !== null) {
			return '#' + el.id;
		}

		var parentWithId = el.closest('[id]'),
			stack = [];

		// Loop through parent elements and build path
		while (el.parentNode != null) {

			// If parent has ID, use that and stop building
			if(el === parentWithId) {
				stack.unshift('#' + parentWithId.id);
				break;
			}

			// No need to go to html
			if(el.nodeName === 'HTML') {
				break;
			}

			var sibCount = 0;
			var sibIndex = 0;
			// get sibling indexes
			for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
				var sib = el.parentNode.childNodes[i];
				if ( sib.nodeName == el.nodeName ) {
					if ( sib === el ) {
						sibIndex = sibCount;
					}
					sibCount++;
				}
			}
			var nodeName = el.nodeName.toLowerCase();
			if ( sibCount > 1 ) {
				stack.unshift(nodeName + ':nth-of-type(' + (sibIndex + 1) + ')');
			} else {
				stack.unshift(nodeName);
			}
			el = el.parentNode;
		}

		stack = stack.join(' > ');

		return stack;
	}
	editableManager.genPath = function(el) {

		var parentCapsule = getParentCapsule(el), // Will change as it breaks out
			isEncapsulated = parentCapsule ? true : false;

		var stack = [];

		while(el) {

			// If top body, stop
			if(el === window.top.document.body) {
				stack.unshift('body');
				break;
			}


			// If capsule
			if(el === parentCapsule) {

				// Shadow root. Add nothing to stack, break out
				if(el.toString() === '[object ShadowRoot]') {
					el = el.host;
				}

				// Iframe body. Add to stack, break out
				else if(el.ownerDocument.defaultView.frameElement) {
					el  = el.ownerDocument.defaultView.frameElement;
				}

				// Find next parent capsule
				parentCapsule = getParentCapsule(el);

				continue;
			}


			// If el has ID
			if(el.id && el.id.match(/^[a-z0-9._-]+$/i) !== null) {

				// If not encapsulated, add to stack and stop
				if(!isEncapsulated) {
					stack.unshift('#' + el.id);
					break;
				}

				// If encapsulated, add to stack and break out
				else {
					var nodeName = '#' + el.id;
					if(el.shadowRoot) {
						nodeName += '::shadow';
					}
					if(el.nodeName === 'IFRAME') {
						nodeName = 'iframe' + nodeName;
					}
					stack.unshift(nodeName);

					if(parentCapsule) {
						if(parentCapsule.toString() === '[object ShadowRoot]') {
							el = parentCapsule.host;
						} else {
							el = parentCapsule.ownerDocument.defaultView.frameElement;
						}
						parentCapsule = getParentCapsule(el);
					} else {
						el = el.parentNode;
					}
					continue;
				}
			}


			var nodeName = el.nodeName.toLowerCase();

			var sibIndex = getSiblingIndex(el);
			if(sibIndex !== false) {
				nodeName += ':nth-of-type(' + (sibIndex) + ')';
			}
			if(el.shadowRoot) {
				nodeName += '::shadow';
			}

			stack.unshift(nodeName);
			el = el.parentNode;
		}


		stack = stack.join(' > ');

		return stack;
	}

	function getSiblingIndex(el) {
		var sibCount = 0;
		var sibIndex = 0;
		// get sibling indexes
		for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
			var sib = el.parentNode.childNodes[i];
			if ( sib.nodeName == el.nodeName ) {
				if ( sib === el ) {
					sibIndex = sibCount;
				}
				sibCount++;
			}
		}

		return sibCount > 1 ? sibIndex+1 : false;

		// Todo: ...
		// if(el.parentNode && el.parentNode.childNodes.length > 0) {
		// 	var sibCount = 0;
		// 	var sibIndex = 0;
		// 	for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
		// 		var sib = el.parentNode.childNodes[i];
		// 		if ( sib.nodeName == el.nodeName ) {
		// 			if ( sib === el ) {
		// 				sibIndex = sibCount;
		// 			}
		// 			sibCount++;
		// 		}
		// 	}
		// }

		// if(sibIndex) {
		// 	return sibCount;
		// }
	}

	function getParentCapsule(node) {
		return getParentShadowHost(node) || getParentIframe(node) || false;
	}

	function getParentShadowHost(node) {

		// Is in shadow DOM?
		for (; node; node = node.parentNode) {
			if (node.toString() === "[object ShadowRoot]") {
				return node;
			}
		}
	}

	function getParentIframe(node) {

		// Is in iframe?
		if(node.ownerDocument.defaultView.frameElement) {
			return node.ownerDocument.documentElement;
		}
	}

	function getCapsuleHost(node) {
		if(node.ownerDocument.defaultView.frameElement) {
			return node.ownerDocument.defaultView.frameElement;
		} else if(node.host) {
			return node.host;
		}
	}

})(terafm.editableManager, terafm.db, terafm.help);