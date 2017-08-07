window.terafm = window.terafm || {};

(function() {

	window.terafm.editableManager = {

		setup: function() {
			setupEventListeners();
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
			resetPlaceholders(keepvalues);
		},

		flashEditable: function(editable) {
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
		},

		getPath: function(el) {
			// Check easy way first, does it have a valid id?
			if(el.id && el.id.match(/^[a-z0-9._-]+$/i) !== null) {
				return '#' + el.id;
			}

			var stack = [];
			while (el.parentNode != null) {
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
			stack.splice(0,1); // removes the html element
			return stack.join(' > ');
		},

		generateEditableId: function(path) {
			return 'field' + terafm.helpers.hash(path);
		},

		getEditable: function(target) {
			return getEditable(target);
		},

		isEditable: function(target) {
			return isEditable(target);
		}

	}


	function setupEventListeners() {
		document.addEventListener('change', documentChangeHandler);
		document.addEventListener('keyup', documentChangeHandler);
	}

	function documentChangeHandler(e) {
		if(isEditable(e.target)) {
			var editable = getEditable(e.target),
				value = getEditableValue(editable);

			saveEditable(editable, value);
		}
	}

	function saveEditable(editable, value) {
			var editablePath = terafm.editableManager.getPath(editable),
				editableId = terafm.editableManager.generateEditableId(editablePath);

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
				path: editablePath
			}

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
		var placeholders = document.querySelectorAll('.teraUIActiveInput');

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
		if(parent) {
			return parent;
		}

		return false;
	}

	function isEditableText(elem) {
		var textEditable = ['email', 'password', 'search', 'tel', 'text', 'url', 'number'];

		if( textEditable.includes(elem.type) || elem.getAttribute('contenteditable') == 'true' || elem.nodeName == 'TEXTAREA' ) {
			return true;
		}
		return false;
	}

})();