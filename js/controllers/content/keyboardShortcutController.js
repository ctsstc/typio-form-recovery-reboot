window.terafm = window.terafm || {};

terafm.keyboardShortcutController = {};

(function(keyboardShortcutController, db, editableManager, initHandler, options, keyboardShortcuts, toast) {
	'use strict';

	var popupNode,
		popupVisible = false;

	keyboardShortcutController.showShortcutDialog = function() {
		showPopup();
	}

	// Open call popup
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'showKeyboardShortcuts') showPopup();
	});

	initHandler.onInit(function() {

		if(options.get('keybindEnabled')) {

			var keybindRestorePreviousSession = options.get('keybindRestorePreviousSession');
			if(keybindRestorePreviousSession.length) keyboardShortcuts.on(keybindRestorePreviousSession, function() {
				toast.create('Restoring previous session')
				
				var fields = db.getLatestSession(),
					totalCount = Object.keys(fields).length,
					fails = 0;

				if(totalCount < 1) {
					return false;
				}

				for(var fieldId in fields) {
					var editable = fields[fieldId];
					var target = editableManager.resolvePath(editable.path);

					if(target) {
						editableManager.setEditableValue(target, editable.value);
						editableManager.flashEditable(target);
					} else {
						fails++;
					}
				}
			});
		}
	})

	function showPopup() {
		build(function() {
			popupNode.classList.remove('hidden');
			popupVisible = true;
		})
	}

	function hidePopup() {
		if(popupVisible) {
			popupNode.classList.add('hidden')
			popupVisible = false;
		}
	}

	function prettyKeyCombo(keyarr) {
		return '<span class="key">' + keyarr.join('</span> <span class="key">') + '</span>';
	}

	function setupEventListeners() {
		popupNode.addEventListener('click', function(e) {
			var target = e.path[0];

			// Close btn
			if(target.dataset.action === 'close') {
				hidePopup();

			// Overlay
			} else if(target.id === 'keyboardShortcutPopup') {
				hidePopup();

			// Opts link
			} else if(target.dataset.action === 'open-options') {
				chrome.runtime.sendMessage({action: 'openSettings'});
			}
		})

		keyboardShortcuts.on(['Escape'], function() {
			hidePopup();
		})
	}

	function build(callback) {
		if(!popupNode) {
			terafm.ui.inject({
				path: 'templates/keyboardShortcutPopup.tpl',
				returnNode: '#keyboardShortcutPopup'
			}, {
				'{{keybindToggleRecDiag}}' : prettyKeyCombo(options.get('keybindToggleRecDiag')),
				'{{keybindRestorePreviousSession}}' : prettyKeyCombo(options.get('keybindRestorePreviousSession')),
				'{{keybindOpenQuickAccess}}' : prettyKeyCombo(options.get('keybindOpenQuickAccess'))
			}, function(res) {
				popupNode = res;
				setupEventListeners();
				callback()
			})
		} else {
			callback()
		}
	}

})(terafm.keyboardShortcutController, terafm.db, terafm.editableManager, terafm.initHandler, terafm.options, terafm.keyboardShortcuts, terafm.toast);