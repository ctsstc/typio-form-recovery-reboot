window.terafm = window.terafm || {};

(function() {

	var tera = {};

	tera.helpers = {};
	tera.UICurrentInput = undefined;
	tera.allowedFieldTypes = ['color', 'date', 'datetime-local', 'email', 'month', 'number', 'password', 'checkbox', 'radio', 'range', 'search', 'tel', 'text', 'time', 'url', 'week'];
	tera.options = {
		savePasswords: false,
		storageTimeDays: 7
	};


	tera.optionValidators = {
		savePasswords: function(bool) {
			return bool == true ? true : false;
		},
		storageTimeDays: function(days) {
			days = parseInt(days);
			return days > 0 && days < 365 ? days : tera.options.storageTimeDays;
		}
	};

	tera.init = function() {

		// Remove expired entries
		//tera.cleanEntries();

		terafm.ui.injectHTML();
		terafm.ui.setupEventHandlers();

		// Override default options
		chrome.storage.sync.get(null, function(options) {
			if(options) {
				for(var opt in options) {
					if(opt in tera.options) {
						tera.options[opt] = tera.optionValidators[opt](options[opt]);
					}
				}
			}
		});
	}

	// Remove entries too old (tera.options.storageTimeDays*86400)
	tera.cleanEntries = function() {
		/*
		var entries = [],
			now = tera.session;


		for (var field in localStorage) {
			if(field.indexOf(tera.storagePrefix) === 0) {

				var entries = JSON.parse(localStorage[field]);

				// Field has entries
				if(Object.keys(entries).length > 0) {
					for(var timestamp in entries) {
						var timeleft = (now-timestamp);

						// Too old
						if (timeleft > (tera.options.storageTimeDays*86400)) {
							delete entries[timestamp];
						}
					}

					// There are entries left, save again
					if(Object.keys(entries).length > 0) {
						entries = JSON.stringify(entries);
						localStorage.setItem(field, entries);
					
					} // All entries are gone, it's an empty object
					else {
						localStorage.removeItem(field);
					}
				}
			}
		}
		*/
	}




	// tera.deleteEntry = deleteSingleRevisionByInput

	// tera.deleteAllEntriesByPathHash = deleteAllRevisionsByInput

	// tera.getEntriesByPath = getRevisionsByInput

	// tera.getEntriesByTimestamp = getRevisionsBySession

	tera.prepareEntryObject = function(obj, size) {

		var timestamps = [], timestamp, count = 0, sliced = {};

		// Store all timestamps
		for(timestamp in obj) {
			if(obj.hasOwnProperty(timestamp)) {
				timestamps.push(parseInt(timestamp));
			}
		}

		// Sort timestamps
		timestamps = timestamps.sort(function(a, b) {
			return a - b;
		}).reverse();

		// Grab X values from obj in order of sorted timestamps
		for(; count < timestamps.length; ++count) {
			if(count >= size) break;
			sliced[timestamps[count]] = obj[timestamps[count]];
		}

		return sliced;
	};


	// Used to check if script is already injected. Message is sent from background.js
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'ping') {
			sendResponse(true);
		}
		else if(request.action === 'contextMenuRecover') {
			/*
			if(tera.UICurrentInput) {
				tera.buildUI();
				tera.showUI();
			}
			*/
			terafm.ui.recoverContextTarget()
		}
	});

	// Check if element is editable
	 function isEditable(elem) {

		// Check if input with valid type
		if(elem.nodeName == 'INPUT' && tera.allowedFieldTypes.includes(elem.type)) {

			// Is it a password field?
			if(elem.type == 'password' && tera.options.savePasswords !== true) {
				return false;
			}

			return true;

		// Check if textarea
		} else if(elem.nodeName == 'TEXTAREA') {
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

			/*
			if(elem.type === 'radio') {
				var siblingRadios = document.querySelectorAll('input[type="radio"][name="'+ elem.name +'"]');

				siblingRadios.forEach(function(sib) {
					if(sib !== elem) {
						tera.deleteEntry(tera.session, sib);
					}
				});
			}
			*/

			var data = {
				value: inputValue, // Not safe value
				path: inputPath
			}

			terafm.db.saveRevision(inputPath, data);
		}
	}


	tera.init();

})();