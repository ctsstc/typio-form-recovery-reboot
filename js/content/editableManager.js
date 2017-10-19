window.terafm = window.terafm || {};
terafm.editableManager = terafm.editableManager || {};

(function() {

	terafm.editableManager.setup = function() {
		setupEventListeners();
	}

	terafm.editableManager.saveEditable = function(editable, value) {
		return saveEditable(editable, value);
	}


	// Todo: Fix! Has duplicates; one local and one public
	terafm.editableManager.setEditableValue = function(editable, value, isPlaceholder) {
		if(isPlaceholder) {
			setPlaceholderClass(editable);
			saveOriginalValue(editable);
		} else {
			removePlaceholderClass(editable);
		}

		setEditableValue(editable, value);
	}

	terafm.editableManager.resetPlaceholders = function(keepvalues) {
		return resetPlaceholders(keepvalues);
	}

	terafm.editableManager.flashEditable = function(editable) {
		return flashEditable(editable);
	}
	// terafm.editableManager.genPath = function(el) {
	// 	return getPath(el);
	// }

	terafm.editableManager.generateEditableId = function(editablePath, framePath) {
		if(!framePath) framePath = '';
		var id = 'field' + hashStr(framePath + editablePath);
		return id;
	}

	terafm.editableManager.getEditableByPath = function(editablePath, framePath) {
		return getEditableByPath(editablePath, framePath);
	}


	function getEditable(target) {
		return terafm.editableManager.getEditable(target);
	}
	// terafm.editableManager.getEditable = function(target) {
	// 	return getEditable(target);
	// }


	function getEditableValue(editable) {
		return terafm.editableManager.getEditableValue(editable);
	}
	// terafm.editableManager.getEditableValue = function(editable) {
	// 	return getEditableValue(editable);
	// }

	function isEditable(target) {
		return terafm.editableManager.isEditable(target);
	}
	// terafm.editableManager.isEditable = function(target) {
	// 	return isEditable(target);
	// }

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

	// Don't wanna debounce this beacause it'd prevent saving search
	// fields and similar if you submit before the timout ends
	function documentChangeHandler(e) {
		// var editable = getEditable(e.target);
		// console.log(e, 'changed')
		var editable = getEditable(e.path[0]);
		if(editable) {
			var value = getEditableValue(editable);
			saveEditable(editable, value);
		}
	}

	function saveEditable(editable, value) {

			var editablePath = terafm.editableManager.genPath(editable),
				framePath = (editable.ownerDocument.defaultView !== window) ? terafm.editableManager.genPath(editable.ownerDocument.defaultView.frameElement) : '',
				editableId = terafm.editableManager.generateEditableId(editablePath, framePath);

			console.log(editable, editablePath);

			// Min length of string to save
			// Don't bother removing HTML here, it's too expensive
			if(value.length < 1) {
				terafm.db.deleteSingleRevisionByEditable(editableId);
				return false;
			}

			// Special care for radio inputs, have to delete siblings
			if(editable.type === 'radio') {
				deleteRadioSiblingsFromStorage(editable, framePath);
			}

			var data = {
				value: value,
				path: editablePath,
				frame: framePath
			}

			// console.log('saving', editableId, data);
			terafm.toast.create('Saved entry');

			terafm.db.saveRevision(editableId, data);
	}

	// Radios require special attention, this is ugly but it'll do for now
	function deleteRadioSiblingsFromStorage(input, framePath) {
		if(input.type == 'radio' && input.name) {
			var siblingRadios = document.querySelectorAll('input[type="radio"][name="'+ input.name +'"]');
			siblingRadios.forEach(function(sib) {
				if(sib !== input) {
					var sibPath = terafm.editableManager.genPath(sib),
						sibId = terafm.editableManager.generateEditableId(sibPath, framePath);
					// Delete current sibling revision
					terafm.db.deleteSingleRevisionByEditable(sibId);
				}
			});
		}
	}

	function resetPlaceholders(keepValue) {
		var placeholders = deepQuerySelectorAll('.terafm-active-input');

		for(i in placeholders) {
			var editable = placeholders[i];

			// querySelectorAll returns an object of DOM nodes and a "length" value, we only wanna loop through the DOMs
			// Switch to foreach to prevent?? There has to be a better way
			if(!editable.nodeName) continue;

			editable.classList.remove('terafm-active-input');

			if(!keepValue) {
				setEditableValue(editable, editable.dataset.teraOrgValue);
			}

			delete editable.dataset.teraOrgValue;
		}
	}

	function setPlaceholderClass(editable) {
		editable.classList.add('terafm-active-input');
	}
	function removePlaceholderClass(editable) {
		editable.classList.remove('terafm-active-input');
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
							var orgPath = terafm.editableManager.genPath(sib);
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

})();