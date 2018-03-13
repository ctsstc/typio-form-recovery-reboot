window.terafm = window.terafm || {};
terafm.keyboardShortcuts = {};

(function(keyboardShortcuts, DOMEvents) {
	'use strict';

	var pressed = [],
		combos = []

	keyboardShortcuts.on = function(keycombo, callback) {
		var combo = JSON.parse(JSON.stringify(keycombo)).map(key => key.toLowerCase())
		combos.push({
			keys: combo,
			callback: callback
		})
	}


	function checkForCombo(event) {
		// Loop through all key combos
		comboLoop:
		for(var combo of combos) {

			// Ignore if not the same number of keys pressed
			if(combo.keys.length !== pressed.length) {
				continue;
			}

			// Abort if not all keys match
			for(var key of combo.keys) {
				if(!pressed.includes(key)) {
					continue comboLoop;
				}
			}

			// It's a match!
			combo.callback(event)
			
			// Do not return; allow multiple identical combos (like Escape)
			// return true
		}
	}

	DOMEvents.registerHandler('keydown', function(e) {
		var lowcase = e.key.toLowerCase();

		if(pressed.indexOf(lowcase) === -1) {
			pressed.push(lowcase);
		}
		
		checkForCombo(e);
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