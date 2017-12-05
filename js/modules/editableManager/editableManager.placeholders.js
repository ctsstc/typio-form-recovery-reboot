window.terafm = window.terafm || {};
terafm.editableManager = terafm.editableManager || {};

(function(editableManager) {
	'use strict';


	let currentPlaceholderEditables = [];


	// Todo: Do i need isPlaceholder param?
	editableManager.setPlaceholderValue = function(editable, entry, isPlaceholder) {
		if(isPlaceholder) {
			setPlaceholderStyle(editable);
			saveOriginalValue(editable);
			currentPlaceholderEditables.push(editable);
		} else {
			removePlaceholderStyle(editable);
		}

		let value = isPlaceholder ? truncateValue(editable, entry) : entry.value;

		editableManager.setEditableValue(editable, value);
	}


	function truncateValue(editable, entry) {

		// If small value, don't truncate
		if((""+entry.value).length < 500) {
			return entry.value;
		}

		// HTML into contentEditable field
		else if(editableManager.isContentEditable(editable) && entry.type === 'contenteditable') {
			return entry.value;

		// Anything into anywhere
		} else {
			return ("" + entry.value).trim().substring(0, 500) + '... (truncated)';
		}
	}



	editableManager.resetPlaceholders = function(keepvalues) {
		return resetPlaceholders(keepvalues);
	}
	editableManager.flashEditable = function(editable) {
		return flashEditable(editable);
	}


	function flashEditable(editable) {
			setTimeout(function() {
				setPlaceholderStyle(editable);
				setTimeout(function() {
					removePlaceholderStyle(editable);
					setTimeout(function() {
						setPlaceholderStyle(editable);
						setTimeout(function() {
							removePlaceholderStyle(editable);
						}, 150);
					}, 150);
				}, 150);
			}, 200);
	}

	function resetPlaceholders(keepValue) {
		var placeholders = currentPlaceholderEditables;

		for(var i in placeholders) {
			var editable = placeholders[i];

			removePlaceholderStyle(editable);

			editable.classList.remove('terafm-active-input');

			if(!keepValue) {
				editableManager.setEditableValue(editable, editable.dataset.teraOrgValue);
			}

			delete editable.dataset.teraOrgValue;
		}

		currentPlaceholderEditables = [];
	}

	function setPlaceholderStyle(editable) {

		// If not already set
		if(editable.dataset.terafmOrgStyle === undefined) {
			var attr = editable.getAttribute('style');
			if(attr) {
				editable.dataset.terafmOrgStyle = attr;
			}
			editable.style.background = 'rgb(255, 251, 153)';
			editable.style.color = '#222';
		}
	}
	function removePlaceholderStyle(editable) {

		// If previous value is exists, restore it
		if(editable.dataset.terafmOrgStyle !== undefined) {
			editable.setAttribute('style', editable.dataset.terafmOrgStyle);
			delete editable.dataset.terafmOrgStyle;

		// Otherwise just clear the style
		} else {
			editable.removeAttribute('style');
		}
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


})(terafm.editableManager);