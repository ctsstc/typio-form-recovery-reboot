window.terafm = window.terafm || {};
terafm.editableManager = terafm.editableManager || {};

(function(editableManager) {
	'use strict';

	var rules = {
		elem: [],
		value: []
	}

	editableManager.checkRules = function(editable, type) {

		if(!editable || !editable.nodeName) return false;

		// Check only a specific type
		if(type) {
			return checkType(editable, type)

		// Check everything
		} else {
			for(type in rules) {
				if(!checkType(editable, type)) return false
			}
		}

		return true;
	}

	function checkType(editable, type) {
		for(var fi in rules[type]) {
			if(!rules[type][fi](editable)) {
				return false
			}
		}
		return true
	}

	// Password type check
	rules.elem.push(function(elem) {
		if(elem.nodeName.toLowerCase() === 'input' && elem.type === 'password' && terafm.options.get('savePasswords') !== true) {
			return false;
		}
		return true;
	})

	// Typio ignore field check
	rules.elem.push(function(elem) {
		return !elem.classList.contains('typioIgnoreField');
	})


	// Credit card value check
	rules.value.push(function(elem) {
		if(editableManager.isEditableText(elem)) {
			let value = editableManager.getEditableValue(elem),
				isCard = /^[0-9\-\s]{8,22}$/.test(value);

			if(isCard && terafm.options.get('saveCreditCards') !== true) {
				return false;
			}
		}

		return true;
	})


})(terafm.editableManager);