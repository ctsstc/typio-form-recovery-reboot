window.terafm = window.terafm || {};
terafm.keyboardShortcuts = {};

(function(keyboardShortcuts, DOMEvents) {
	'use strict';

	var pressed = [],
		combos = []

	keyboardShortcuts.on = function(keycombo, callback) {
		combos.push({
			keys: JSON.parse(JSON.stringify(keycombo)),
			callback: callback
		})
	}


	function checkForCombo() {

		// Loop through all key combos
		comboLoop:
		for(var combo of combos) {

			// Ignore if not the same number of keys pressed
			if(combo.keys.length !== pressed.length) {
				continue;
			}

			// Check if all keys match
			for(var key of combo.keys) {
				if(!pressed.includes(key)) {
					continue comboLoop;
				}
			}

			// Success!
			combo.callback()
			return true
		}
	}

	DOMEvents.registerHandler('keydown', function(e) {
		
		if(pressed.indexOf(e.key) === -1) {
			pressed.push(e.key);
		}

		// console.log('pressed:', pressed)

		if(checkForCombo() && e.preventDefault) {
			e.preventDefault()
		}
	})

	DOMEvents.registerHandler('keyup', function(e) {
		pressed = []

		// var pi = pressed.indexOf(e.key)
		// if(pi > 0) {
		// 	pressed = pressed.splice(pi, 0)
		// 	console.log('keyup', pressed)
		// }
	})


})(terafm.keyboardShortcuts, terafm.DOMEvents);