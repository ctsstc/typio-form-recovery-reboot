window.terafm = window.terafm || {};
terafm.editableManager = terafm.editableManager || {};

(function(editableManager, help) {
	'use strict';

	// Todo: Fix! Has duplicates; one private and one public
	editableManager.setEditableValue = function(editable, value, isPlaceholder) {
		if(isPlaceholder) {
			setPlaceholderClass(editable);
			saveOriginalValue(editable);
		} else {
			removePlaceholderClass(editable);
		}

		setEditableValue(editable, value);
	}

	editableManager.resetPlaceholders = function(keepvalues) {
		return resetPlaceholders(keepvalues);
	}

	editableManager.flashEditable = function(editable) {
		return flashEditable(editable);
	}

	editableManager.getEditableByPath = function(editablePath, framePath) {
		return getEditableByPath(editablePath, framePath);
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

	function resetPlaceholders(keepValue) {
		var placeholders = help.deepQuerySelectorAll('.terafm-active-input');

		for(var i in placeholders) {
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

})(terafm.editableManager, terafm.help);