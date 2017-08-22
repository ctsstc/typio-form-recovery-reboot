window.terafm = window.terafm || {};

(function() {

	window.terafm.editableManager = {

		setup: function() {
			setupEventListeners();
		},

		saveEditable: function(editable, value) {
			return saveEditable(editable, value);
		},

		setEditableValue: function(editable, value, isPlaceholder) {
			if(isPlaceholder) {
				setPlaceholderClass(editable);
				saveOriginalValue(editable);
			} else {
				removePlaceholderClass(editable);
			}

			setEditableValue(editable, value);
		},

		resetPlaceholders: function(keepvalues) {
			return resetPlaceholders(keepvalues);
		},

		flashEditable: function(editable) {
			return flashEditable(editable);
		},
		getPath: function(el) {
			return getPath(el);
		},

		generateEditableId: function(editablePath, framePath) {
			if(!framePath) framePath = '';
			var id = 'field' + terafm.helpers.hash(framePath + editablePath);
			return id;
		},

		getEditableByPath: function(editablePath, framePath) {
			return getEditableByPath(editablePath, framePath);
		},

		getEditable: function(target) {
			return getEditable(target);
		},

		getEditableValue: function(editable) {
			return getEditableValue(editable);
		},

		isEditable: function(target) {
			return isEditable(target);
		}

	}


	// See here for possible improvements:
	// https://stackoverflow.com/questions/5728558/get-the-dom-path-of-the-clicked-a
	// Careful cause changing this will result in editableID's changing
	// which results in entries not being shown in context menu
	function getPath(el) {

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
			if(el === document.body) {
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

	function flashEditable(editable) {
			setTimeout(function() {
				setPlaceholderClass(editable);
				setTimeout(function() {
					removePlaceholderClass(editable);
					setTimeout(function() {
						setPlaceholderClass(editable);
						setTimeout(function() {
							removePlaceholderClass(editable);
						}, 150);
					}, 150);
				}, 150);
			}, 200);
	}

	function setupEventListeners() {
		document.addEventListener('change', documentChangeHandler);
		document.addEventListener('keyup', documentChangeHandler);
	}

	function documentChangeHandler(e) {
		var editable = getEditable(e.target);
		if(editable) {
			var value = getEditableValue(editable);

			saveEditable(editable, value);
		}
	}

	function saveEditable(editable, value) {

			var editablePath = terafm.editableManager.getPath(editable),
				framePath = (editable.ownerDocument.defaultView !== window) ? terafm.editableManager.getPath(editable.ownerDocument.defaultView.frameElement) : '',
				editableId = terafm.editableManager.generateEditableId(editablePath, framePath);

			// Min length of string to save
			if(value.length < 1) {
				terafm.db.deleteSingleRevisionByEditable(editableId);
				return false;
			}

			// Special care for radio inputs, have to delete siblings
			if(editable.type === 'radio') {
				deleteRadioSiblingsFromStorage(editable);
			}

			var data = {
				value: value,
				path: editablePath,
				frame: framePath
			}

			// console.log('saving', editableId, data);

			terafm.db.saveRevision(editableId, data);
	}

	// Radios require special attention, this is ugly but idk what to do with it
	function deleteRadioSiblingsFromStorage(input) {
		if(input.type == 'radio' && input.name) {
			var siblingRadios = document.querySelectorAll('input[type="radio"][name="'+ input.name +'"]');
			siblingRadios.forEach(function(sib) {
				if(sib !== input) {
					var sibPath = terafm.editableManager.getPath(sib);
					// Delete current sibling revision
					terafm.db.deleteSingleRevisionByInput(sibPath);
				}
			});
		}
	}

	function resetPlaceholders(keepValue) {
		var placeholders = terafm.ui.deepQuerySelectorAll('.teraUIActiveInput');

		for(i in placeholders) {
			var editable = placeholders[i];

			// querySelectorAll returns an object of DOM nodes and a "length" value, we only wanna loop through the DOMs
			// Switch to foreach to prevent?? There has to be a better way
			if(!editable.nodeName) continue;

			editable.classList.remove('teraUIActiveInput');

			if(!keepValue) {
				setEditableValue(editable, editable.dataset.teraOrgValue);
			}

			delete editable.dataset.teraOrgValue;
		}
	}


	function getEditableValue(editable) {
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

	function setPlaceholderClass(editable) {
		editable.classList.add('teraUIActiveInput');
	}
	function removePlaceholderClass(editable) {
		editable.classList.remove('teraUIActiveInput');
	}

	// Saves editable value in dataset to be restored later
	function saveOriginalValue(editable) {

		if(!editable.dataset.hasOwnProperty('teraOrgValue')) {
			if(editable.nodeName == 'INPUT' || editable.nodeName == 'TEXTAREA') {

				if(editable.type === 'checkbox') {
					editable.dataset.teraOrgValue = editable.checked ? 1 : 0;

				} else if(editable.type === 'radio') {
					var radioSiblings = document.querySelectorAll('input[type=radio][name="'+ editable.name +'"]');
					radioSiblings.forEach(function(sib) {
						if(sib.checked) {
							var orgPath = terafm.editableManager.getPath(sib);
							editable.dataset.teraOrgValue = orgPath;
						}
					});

				// Probably text/password/email or something with a value property
				} else {
					editable.dataset.teraOrgValue = editable.value;
				}

			} else if(editable.nodeName == 'SELECT') {
				editable.dataset.teraOrgValue = editable.value;

			// Contenteditable
			} else {
				editable.dataset.teraOrgValue = editable.innerHTML;
			}
		}
	}



	function setEditableValue(editable, val) {
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

	// Check if element is editable
	// In case of contenteditable it does NOT check if element is within
	// a contenteditable field.
	function isEditable(elem) {

		// Check if input with valid type
		if(elem.nodeName == 'INPUT' && terafm.engine.options.allowedInputTypes.includes(elem.type)) {

			// Is it a password field?
			if(elem.type == 'password' && terafm.engine.options.savePasswords !== true) {
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
	
	// Check if element is editable OR is within a contenteditable parent
	function getEditable(elem) {
		if(isEditable(elem)) return elem;

		// Iterate every parent, return if parent is editable
		//return terafm.ui.parent(elem, function(elem) { return elem.getAttribute('contenteditable') == 'true' });
		var parent = elem.closest('[contenteditable]');
		if(parent !== null) {
			return parent;
		}

		return false;
	}

	function getEditableByPath(editablePath, framePath) {

		try {
			if(framePath) {
				var frame = document.querySelector(framePath);

				if(frame) {
					var editable = frame.contentDocument.querySelector(editablePath);
					return editable;
				}

			} else {
				return document.querySelector(editablePath);
			}
		} catch(e) {
			return false; // Probably invalid selector
		}
	}

	function isEditableText(elem) {
		var textEditable = ['email', 'password', 'search', 'tel', 'text', 'url', 'number'];

		if( textEditable.includes(elem.type) || elem.getAttribute('contenteditable') == 'true' || elem.nodeName == 'TEXTAREA' ) {
			return true;
		}
		return false;
	}

})();