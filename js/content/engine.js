(function() {

	var terafm = window.terafm || {};

	var shadowRoot;

	var optionSanitizers = {
		savePasswords: function(bool) {
			return bool == true ? true : false;
		},
		storageTimeDays: function(days) {
			days = parseInt(days);
			return	(days > 0 && days < 366) ? days :
					(days > 365) ? 365 : 
					(days < 1) ? 1 :
					tera.options.storageTimeDays;
		}
	};

	terafm.globalOptions = {
		editableTypes: ['color', 'date', 'datetime-local', 'email', 'month', 'number', 'password', 'checkbox', 'radio', 'range', 'search', 'tel', 'text', 'time', 'url', 'week'],
		textEditableTypes: ['text', 'email', 'search', 'password', 'url', 'tel'],

		savePasswords: false,
		storageTimeDays: 7,
	}


	terafm.getShadowRoot = function() {
		return shadowRoot || createShadowRoot();
	}

	function init() {
/*
		setTimeout(function() {
			console.log('---------------------');
			var t = document.querySelector('#shadow').shadowRoot.querySelector('div').shadowRoot.querySelector('iframe').contentWindow.document.querySelector('.sec').shadowRoot.querySelector('input');
			var path = terafm.editableManager.genPath(t);

			console.log('generated:', path);
			var found = $(path);
			console.log('found:', found);
			return;
			
		}, 500);
*/

		// Initiate DB, populate in-memory storage
		terafm.db.init(function() {

			// Load extension options into memory
			loadExtensionOptions(function() {

				// Delete old stuff (by storageDays option)
				deleteExpiredSessions();

				// Initiated because it listens for input changes
				terafm.editableManager.setup();

				// if(window.location.host === 's.codepen.io' && window.top === window) {
				// 	setTimeout(function() {
				// 		terafm.dialog.open();
				// 	}, 300); 
				// }

			});

		});

		setupKeyboardShortcuts();

		// Initiated because it listens for rightclicks (html only injected when contextmenu is triggered)
		terafm.context.setup();
	}

	function setupKeyboardShortcuts() {

		Mousetrap.bindGlobal('ctrl+del', function(e) {

			var fields = terafm.db.getLatestSession(),
				totalCount = Object.keys(fields).length,
				fails = 0;

			if(totalCount < 1) {
				terafm.toast.create('Nothing to restore.')
				return false;
			}

			for(var fieldId in fields) {
				var editable = fields[fieldId];
				var target = terafm.editableManager.getEditableByPath(editable.path, editable.frame);

				if(target) {
					terafm.editableManager.setEditableValue(target, editable.value);
					terafm.editableManager.flashEditable(target);
				} else {
					fails++;
				}
			}

			if(fails === 0) {
				terafm.toast.create('Recovered previous session.');
			} else {
				terafm.toast.create(fails + ' previous entries could not be restored automatically. Open form recovery to restore fields manually.', 10*1000);
			}

		});
	}

	function createShadowRoot() {
		document.body.insertAdjacentHTML('beforeend', '<div id="terafm-shadow"></div>');

		shadowRoot = document.getElementById('terafm-shadow').attachShadow({mode: 'open'});
		shadowRoot.innerHTML = '<div>';
		shadowRoot.querySelector('div').insertAdjacentHTML('beforeend', '<style> @import "' + chrome.runtime.getURL('css/contentShadowRoot.css') + '"; </style>');

		return shadowRoot;
	}

	function loadExtensionOptions(callback) {

		// Override default options
		chrome.storage.sync.get(null, function(options) {
			if(options) {
				for(var opt in options) {
					if(opt in terafm.globalOptions) {
						terafm.globalOptions[opt] = optionSanitizers[opt](options[opt]);
					}
				}
			}
			callback();
		});

	}


	function deleteExpiredSessions() {

		var editables = terafm.db.getAllRevisions(),
			// Now - Seconds to store = past point in time when everything earlier is expired
			expirePoint = terafm.db.sessionId() - (terafm.globalOptions.storageTimeDays * 86400); // 86400 = 24h

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

	// Used to check if script is already injected. Message is sent from background.js
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

		// Used to check if content scripts are already injected
		if(request.action === 'ping') {
			sendResponse(true);
		
		} else if(request.action === 'contextMenuRecover') {
			terafm.context.open();

		} else if(request.action === 'openRecoveryDialog') {
			terafm.dialog.open();

		} else if(request.action === 'clearData') {
			terafm.db.deleteAllSessions();
			terafm.dialog.close();
		}
	});


	init();

})();