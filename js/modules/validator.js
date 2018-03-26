window.terafm = window.terafm || {};
terafm.validator = terafm.validator || {};

(function(validator) {
	'use strict';

	var validators = {
		elem: [],
		value: []
	}

	validator.validate = function(editable, type) {

		if(!(editable instanceof terafm.Editable)) throw new Error('Validator expects an Editable');

		// Check only a specific type
		if(type) {
			return checkType(editable, type)

		// Check everything
		} else {
			for(type in validators) {
				if(!checkType(editable, type)) return false
			}
		}

		return true;
	}

	function checkType(editable, type) {
		for(var fi in validators[type]) {
			if(!validators[type][fi](editable)) {
				return false
			}
		}
		return true
	}

	// Password type check
	validators.elem.push(function(editable) {
		if(editable.el.nodeName.toLowerCase() === 'input' && editable.el.type === 'password' && terafm.options.get('savePasswords') !== true) {
			return false;
		}
		return true;
	})

	// Typio ignore field check
	validators.elem.push(function(editable) {
		return !editable.el.classList.contains('typioIgnoreField');
	})


	// Credit card value check
	validators.value.push(function(editable) {
		if(editable.isTextEditable()) {
			let value = editable.getValue(),
				isCard = /^[0-9\-\s]{8,22}$/.test(value);

			if(isCard && terafm.options.get('saveCreditCards') !== true) {
				return false;
			}
		}

		return true;
	})

	// Empty text editable value
	// validators.value.push(editable => {
	// 	if(!editable.isTextEditable() || editable.getValue().length > 0) {
	// 		return true;
	// 	}
	// });


})(terafm.validator);