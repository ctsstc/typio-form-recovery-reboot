window.terafm = window.terafm || {};

(function() {

	var tera = {

	};

	tera.options = {
		savePasswords: false,
		storageTimeDays: 7,
		
	};


	tera.optionSanitizers = {
		savePasswords: function(bool) {
			return bool == true ? true : false;
		},
		storageTimeDays: function(days) {
			days = parseInt(days);
			return (days > 0 && days < 366) ? days : (days > 365) ? days : tera.options.storageTimeDays;
		}
	};

	function init() {

		terafm.db.init(function() {
			loadExtensionOptions(function() {
				deleteExpiredSessions();
			});
		});

		terafm.inputManager.setup();
		terafm.dialog.setup();
		terafm.context.setup();
	}

	function loadExtensionOptions(callback) {

		// Override default options
		chrome.storage.sync.get(null, function(options) {
			if(options) {
				for(var opt in options) {
					if(opt in tera.options) {
						tera.options[opt] = tera.optionSanitizers[opt](options[opt]);
					}
				}
			}
		});

	}

	function deleteExpiredSessions() {

		var inputs = terafm.db.getAllRevisions(),
			// Now - Seconds to store = past point in time when everything earlier is expired
			expirePoint = terafm.db.sessionId() - (tera.options.storageTimeDays * 86400); // 86400 = 24h

		for (inputId in inputs) {
			for(session in inputs[inputId]) {

				// Expired
				if(session < expirePoint) {
					terafm.db.deleteSingleRevisionByInputId(inputId, session);
				}
			}
		}
	}

	function deleteRadioSiblingsFromStorage(input) {
		if(input.type == 'radio' && input.name) {
			var siblingRadios = document.querySelectorAll('input[type="radio"][name="'+ input.name +'"]');
			siblingRadios.forEach(function(sib) {
				if(sib !== input) {
					var sibPath = terafm.ui.generateDomPath(sib);
					// Delete current sibling revision
					terafm.db.deleteSingleRevisionByInput(sibPath);
				}
			});
		}
	}


	terafm.engine = {

		options: {
			allowedInputTypes: ['color', 'date', 'datetime-local', 'email', 'month', 'number', 'password', 'checkbox', 'radio', 'range', 'search', 'tel', 'text', 'time', 'url', 'week'],
		},

		saveRevision: function(input, inputValue) {

			if(!isEditable(input)) {
				return false;
			}

			var inputPath = terafm.ui.generateDomPath(input),
				inputId = terafm.helpers.generateInputId(inputPath),

				safeInputValue = terafm.helpers.encodeHTML(inputValue);


			// Min length of string to save (only if text input)
			if(safeInputValue.length < 1 && isEditableText(input)) {
				terafm.db.deleteSingleRevisionByInput(inputPath);
				return false;
			}

			// Special care for radio inputs, have to delete siblings
			if(input.type === 'radio') {
				deleteRadioSiblingsFromStorage(input);
			}

			var data = {
				value: inputValue, // Not safe value
				path: inputPath
			}

			terafm.db.saveRevision(inputPath, data);
		},

		recoverSession: function(session) {
			// for(input in session) {
				console.log(session)
			// }
		},
		recoverInput: function(input, session) {

		},

		recoverInputInto: function(input, session, target) {

		}
	}


	// Used to check if script is already injected. Message is sent from background.js
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

		// Used to check if content scripts are already injected
		if(request.action === 'ping') {
			sendResponse(true);
		
		} else if(request.action === 'contextMenuRecover') {
			terafm.context.open();

		} else if(request.action === 'openRecoveryDialog') {
			terafm.dialog.open();
		}
	});


	init();

})();