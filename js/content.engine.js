window.terafm = window.terafm || {};

(function() {

	var optionSanitizers = {
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

				if(window.location.host === 's.codepen.io') {
					terafm.dialog.open();
				}
			});
		});

		terafm.editableManager.setup();
		terafm.dialog.setup();
		terafm.context.setup();
	}

	function loadExtensionOptions(callback) {

		// Override default options
		chrome.storage.sync.get(null, function(options) {
			if(options) {
				for(var opt in options) {
					if(opt in terafm.engine.options) {
						terafm.engine.options[opt] = optionSanitizers[opt](options[opt]);
					}
				}
			}
			callback();
		});

	}


	function deleteExpiredSessions() {

		var editables = terafm.db.getAllRevisions(),
			// Now - Seconds to store = past point in time when everything earlier is expired
			expirePoint = terafm.db.sessionId() - (terafm.engine.options.storageTimeDays * 86400); // 86400 = 24h

		for (editableId in editables) {
			for(session in editables[editableId]) {

				// Expired
				if(session < expirePoint) {
					terafm.db.deleteSingleRevisionByEditable(editableId, session);
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
		
			savePasswords: false,
			storageTimeDays: 7,
		},

		saveRevision: function(editable, editableValue) {

			if(!isEditable(editable)) {
				return false;
			}

			var editablePath = terafm.ui.generateDomPath(editable),
				editableId = terafm.helpers.generateEditableId(editablePath),

				safeEditableValue = terafm.helpers.encodeHTML(editableValue);


			// Min length of string to save (only if text editable)
			if(safeEditableValue.length < 1 && isEditableText(editable)) {
				terafm.db.deleteSingleRevisionByInput(editablePath);
				return false;
			}

			// Special care for radio inputs, have to delete siblings
			if(editable.type === 'radio') {
				deleteRadioSiblingsFromStorage(editable);
			}

			var data = {
				value: editableValue, // Not safe value
				path: editablePath
			}

			terafm.db.saveRevision(editableId, data);
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