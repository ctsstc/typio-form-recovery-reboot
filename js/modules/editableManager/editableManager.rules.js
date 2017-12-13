window.terafm = window.terafm || {};
terafm.editableManager = terafm.editableManager || {};

(function(editableManager) {
	'use strict';

	editableManager.checkRules = function(editable) {

		if(!passwordCheck(editable)) 	return false;
		if(!creditCardCheck(editable)) 	return false;

		return true;
	}


	function passwordCheck(elem) {
		if(elem.nodeName === 'INPUT' && elem.type === 'password' && terafm.options.get('savePasswords') !== true) {
			// console.log('password rule check failed');
			return false;
		}
		return true;
	}
	function creditCardCheck(elem) {
		if(editableManager.isEditableText(elem)) {
			let value = editableManager.getEditableValue(elem),
				isCard = /^[0-9\-\s]{8,22}$/.test(value);

			if(isCard && terafm.options.get('saveCreditCards') !== true) {
				// console.log('credit card detected and disallowed');
				return false;
			}
		}

		return true;
	}


})(terafm.editableManager);