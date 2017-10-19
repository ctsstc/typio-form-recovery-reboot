(function() {

	var terafm = window.terafm || {};
	terafm.editableManager = terafm.editableManager || {};


	// Check if element is editable
	// In case of contenteditable it does NOT check if element is within
	// a contenteditable field.
	terafm.editableManager.isEditable = function(elem) {

		// Check if input with valid type
		if(elem.nodeName == 'INPUT' && terafm.globalOptions.editableTypes.includes(elem.type)) {

			// Is it a password field?
			if(elem.type == 'password' && terafm.globalOptions.savePasswords !== true) {
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

	terafm.editableManager.isEditableText = function(elem) {

		if( terafm.globalOptions.textEditableTypes.includes(elem.type) || elem.getAttribute('contenteditable') == 'true' || elem.nodeName == 'TEXTAREA' ) {
			return true;
		}
		return false;
	}
	
	// Check if element is editable OR is within a contenteditable parent
	terafm.editableManager.getEditable = function(elem) {
		if(terafm.editableManager.isEditable(elem)) return elem;

		// Iterate every parent, return if parent is editable
		//return parentElem(elem, function(elem) { return elem.getAttribute('contenteditable') == 'true' });
		var parent = elem.closest('[contenteditable]');
		if(parent !== null) {
			return parent;
		}

		return false;
	}


	terafm.editableManager.getEditableValue = function(editable) {
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



	// Todo: Depr framepath
	erafm.editableManager.generateEditableId = function(editablePath, framePath) {
		if(!framePath) framePath = '';
		var id = 'field' + hashStr(framePath + editablePath);
		return id;
	}

	// See here for possible improvements:
	// https://stackoverflow.com/questions/5728558/get-the-dom-path-of-the-clicked-a
	// Careful cause changing this will result in editableID's changing
	// which results in entries not being shown in context menu
	// Todo: Break through iframes
	function GET_PATH_BACKUP(el) {

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
	terafm.editableManager.genPath = function(el) {

		// Check easy way first, does elem have a valid id?
		if(!isInShadow && (el.id && el.id.match(/^[a-z0-9._-]+$/i) !== null) ) {
			return '#' + el.id;
		}

		var parentWithId = !isInShadow ? el.closest('[id]') : false;

		var stack = [],
			isShadow = false;

		// Loop through parent elements and build path
		while (el.parentNode != null) {

			// If parent has ID, use that and stop building
			if(!isInShadow && el === parentWithId) {
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
			if (isShadow) {
				nodeName += "::shadow";
				isShadow = false;
			}
			if ( sibCount > 1 ) {
				stack.unshift(nodeName + ':nth-of-type(' + (sibIndex + 1) + ')');
			} else {
				stack.unshift(nodeName);
			}
			el = el.parentNode;
			if (el.nodeType === 11) {  // for shadow dom
				isShadow = true;
				el = el.host;
			}
		}

		stack = stack.join(' > ');

		return stack;
	}

})();