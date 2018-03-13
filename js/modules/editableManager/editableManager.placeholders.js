window.terafm = window.terafm || {};
terafm.editableManager = terafm.editableManager || {};

(function(editableManager) {
	'use strict';

	let currentPlaceholderEditables = [];

	editableManager.restoreBy = function(commit, sessionId, editableId, target) {

		// By session only
		if(sessionId && !editableId) {

			let session = terafm.db.getRevisionsBySession(sessionId);

			for(editableId in session) {
				let editable = editableManager.resolvePath(session[editableId].path);

				if(editable) {
					editableManager.setPlaceholderValue(editable, session[editableId], !commit);
				}
			}


		// By session and editableId (single)
		} else if(sessionId && editableId) {

			let rev = terafm.db.getSingleRevisionByEditableAndSession(editableId, sessionId);

			if(rev) {
				editableManager.setPlaceholderValue(target, rev, !commit);
			}

		}
	}

	editableManager.setPlaceholderValue = function(editable, entry, isPlaceholder) {

		if(isPlaceholder) {
			setPlaceholderStyle(editable);
			saveOriginalValue(editable);
			currentPlaceholderEditables.push(editable);
		} else {
			removePlaceholderStyle(editable);
		}

		// If restoring html into text field
		if(!editableManager.isContentEditable(editable) && entry.type === 'contenteditable') {
			entry.value = terafm.help.stripTags(entry.value);
			entry.value = terafm.help.decodeHTMLEntities(entry.value);
			entry.value = terafm.help.trim(entry.value);

		// Restoring text into html field
		} else if(editableManager.isContentEditable(editable) && entry.type !== 'contenteditable') {
			entry.value = terafm.help.encodeHTMLEntities(entry.value);
		}

		let value = isPlaceholder ? truncateValue(editable, entry) : entry.value;
		// var value = entry.value;

		editableManager.setEditableValue(editable, value);
	}


	function truncateValue(editable, entry) {
		var truncLength = 500;

		// If small value, don't truncate
		if((""+entry.value).length < truncLength) {
			return entry.value;
		}

		// HTML into contentEditable field
		else if(editableManager.isContentEditable(editable) && entry.type === 'contenteditable') {
			return entry.value;

		// Anything into anywhere
		} else {
			return (entry.value + ' ').substring(0, truncLength) + '... (truncated)';
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
		if(editable.terafmOrgStyle === undefined) {
			var attr = editable.getAttribute('style') || '';
			editable.terafmOrgStyle = attr;
			
			editable.style.background = 'rgb(255, 251, 153)';
			editable.style.color = '#222';
		}
	}
	function removePlaceholderStyle(editable) {

		// If previous value is exists, restore it
		if(editable.terafmOrgStyle !== undefined) {
			editable.setAttribute('style', editable.terafmOrgStyle);
			delete editable.terafmOrgStyle;
		}
	}

	// Saves editable value in dataset to be restored later
	function saveOriginalValue(editable) {

		if(!editable.dataset.hasOwnProperty('teraOrgValue')) {
			if(editable.nodeName.toLowerCase() == 'input' || editable.nodeName.toLowerCase() == 'textarea') {

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

			} else if(editable.nodeName.toLowerCase() == 'select') {
				editable.dataset.teraOrgValue = editable.value;

			// Contenteditable
			} else {
				editable.dataset.teraOrgValue = editable.innerHTML;
			}
		}
	}


})(terafm.editableManager);