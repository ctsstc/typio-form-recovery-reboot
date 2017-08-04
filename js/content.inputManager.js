window.terafm = window.terafm || {};

(function() {

	window.terafm.inputManager = {

		setup: function() {
			setupEventListeners();
		},

		setInputValue: function(input, value, placeholder) {
			if(placeholder) {
				setPlaceholderClass(input);
				saveOriginalValue(input);
			} else {
				removePlaceholderClass(input);
			}

			setInputValue(input, value);
		},

		resetPlaceholders: function(keepvalues) {
			resetPlaceholders(keepvalues);
		},

		// Todo: Cash path in data attribute.
		// How to handle element move? Does it ever happen? Maybe if siblings are removed?
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
			var editablePath = terafm.inputManager.getPath(editable);

			// Min length of string to save
			if(value.length < 1) {
				terafm.db.deleteSingleRevisionByInput(editablePath);
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

			terafm.db.saveRevision(editablePath, data);
	}

	// Radios require special attention, this is ugly but idk what to do with it
	function deleteRadioSiblingsFromStorage(input) {
		if(input.type == 'radio' && input.name) {
			var siblingRadios = document.querySelectorAll('input[type="radio"][name="'+ input.name +'"]');
			siblingRadios.forEach(function(sib) {
				if(sib !== input) {
					var sibPath = terafm.inputManager.getPath(sib);
					// Delete current sibling revision
					terafm.db.deleteSingleRevisionByInput(sibPath);
				}
			});
		}
	}

	function resetPlaceholders(keepValue) {
		var phs = document.querySelectorAll('.teraUIActiveInput');

		for(i in phs) {
			var input = phs[i];

			// TODO: Switch to foreach to prevent??
			// querySelectorAll returns an object of DOM nodes and a "length" value, we only wanna loop through the DOMs
			if(!input.nodeName) continue;

			input.classList.remove('teraUIActiveInput');

			if(!keepValue) {
				setInputValue(input, input.dataset.teraOrgValue);
			}

			delete input.dataset.teraOrgValue;
		}
	}


	function getEditableValue(input) {
		if(input.nodeName == 'INPUT' || input.nodeName == 'TEXTAREA') {

			// Special care for checkable inputs
			if(input.type === 'checkbox' || input.type === 'radio') {
				return input.checked ? 1 : 0;

			} else {
				return input.value;
			}

		} else if(input.nodeName === 'SELECT') {
			return input.value;
		}
		return input.innerHTML;
	}

	function setPlaceholderClass(input) {
		input.classList.add('teraUIActiveInput');
	}
	function removePlaceholderClass(input) {
		input.classList.remove('teraUIActiveInput');
	}

	// Saves editable value in dataset to be restored later
	function saveOriginalValue(input) {

		if(!input.dataset.hasOwnProperty('teraOrgValue')) {
			if(input.nodeName == 'INPUT' || input.nodeName == 'TEXTAREA') {

				if(input.type === 'checkbox') {
					input.dataset.teraOrgValue = input.checked ? 1 : 0;

				} else if(input.type === 'radio') {
					var radioSiblings = document.querySelectorAll('input[type=radio][name="'+ input.name +'"]');
					radioSiblings.forEach(function(sib) {
						if(sib.checked) {
							var orgPath = terafm.inputManager.getPath(sib);
							input.dataset.teraOrgValue = orgPath;
						}
					});

				} else {
					input.dataset.teraOrgValue = input.value;
				}

			} else if(input.nodeName == 'SELECT') {
				input.dataset.teraOrgValue = input.value;

			// Contenteditable
			} else {
				input.dataset.teraOrgValue = input.innerHTML;
			}
		}
	}



	function setInputValue(input, val) {

		if(input.nodeName == 'INPUT' || input.nodeName == 'TEXTAREA') {

			// Special care for checkable inputs
			if(input.type === 'checkbox') {
				val = parseInt(val);
				input.checked = val ? true : false;

			} else if(input.type === 'radio') {

				// Set by value
				if(val == parseInt(val)) {
					input.checked = true;

				// Set by path
				} else {
					var orgRadio = document.querySelector(val);
					if(orgRadio) {
						orgRadio.checked = true;
					}
				}

			} else {
				input.value = val;
			}

		} else if(input.nodeName == 'SELECT') {
			input.value = val;

		} else {
			input.innerHTML = val;
		}
	}

	// Check if element is editable
	function isEditable(elem) {

		// Check if input with valid type
		if(elem.nodeName == 'INPUT' && terafm.engine.options.allowedInputTypes.includes(elem.type)) {

			// Is it a password field?
			if(elem.type == 'password' && tera.options.savePasswords !== true) {
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
		return terafm.ui.parent(elem, function(elem) { return elem.getAttribute('contenteditable') == 'true' })
	}

	function isEditableText(elem) {
		var textEditable = ['email', 'password', 'search', 'tel', 'text', 'url', 'number'];

		if( textEditable.includes(elem.type) || elem.getAttribute('contenteditable') == 'true' || elem.nodeName == 'TEXTAREA' ) {
			return true;
		}
		return false;
	}

})();