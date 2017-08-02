window.terafm = window.terafm || {};

(function() {

	var tera = {};

	tera.helpers = {};
	tera.UICurrentInput = undefined;
	tera.allowedInputTypes = ['color', 'date', 'datetime-local', 'email', 'month', 'number', 'password', 'checkbox', 'radio', 'range', 'search', 'tel', 'text', 'time', 'url', 'week'];
	tera.options = {
		savePasswords: false,
		storageTimeDays: 7
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

	tera.init = function() {

		terafm.ui.injectHTML();
		terafm.ui.setupEventHandlers();

		// Override default options
		chrome.storage.sync.get(null, function(options) {
			if(options) {
				for(var opt in options) {
					if(opt in tera.options) {
						tera.options[opt] = tera.optionSanitizers[opt](options[opt]);
					}
				}
			}

			// Remove expired entries
			tera.deleteExpiredSessions();
		});
	}

	tera.deleteExpiredSessions = function() {

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


	// Used to check if script is already injected. Message is sent from background.js
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'ping') {
			sendResponse(true);
		}
		else if(request.action === 'contextMenuRecover') {
			terafm.ui.recoverContextTarget()
		}
	});

	// Check if element is editable
	function isEditable(elem) {

		// Check if input with valid type
		if(elem.nodeName == 'INPUT' && tera.allowedInputTypes.includes(elem.type)) {

			// Is it a password field?
			if(elem.type == 'password' && tera.options.savePasswords !== true) {
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
	
	// Check if element is editable OR is within a contenteditable parent
	function getEditable(elem) {
		if(tera.isEditable(elem)) return elem;
		return terafm.ui.parent(elem, function(elem) { return elem.getAttribute('contenteditable') == 'true' })
	}

	function isEditableText(elem) {
		var textEditable = ['email', 'password', 'search', 'tel', 'text', 'url', 'number'];

		if( textEditable.includes(elem.type) || elem.getAttribute('contenteditable') == 'true' || elem.nodeName == 'TEXTAREA' ) {
			return true;
		}
		return false;
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

		saveRevision: function(input, inputValue) {

			if(!isEditable(input)) {
				return false;
			}

			var inputPath = terafm.ui.generateDomPath(input),
				inputId = terafm.helpers.generateInputId(inputPath),

				safeInputValue = terafm.helpers.encodeHTML(input);


			// Min length of string to save (only if text input)
			if(safeInputValue.length < 1 && tera.isEditableText(input)) {
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
		}
	}


	tera.init();

})();