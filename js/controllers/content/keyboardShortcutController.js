window.terafm = window.terafm || {};

terafm.keyboardShortcutController = {};

(function(keyboardShortcutController, db, editableManager, initHandler, options, keyboardShortcuts, toast) {
	// 'use strict';

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
	});

	function showPopup() {
		build(function() {
			popupNode.classList.remove('hidden');
			popupVisible = true;
		})
	}

	function build(callback) {
		terafm.ui.inject({
			html: '<div id="tmp-holder"></div>',
			returnNode: '#tmp-holder'
		}, function(rootnode) {
			makeVue(rootnode, callback);
		});
	}

	function makeVue(rootnode, callback) {

		// console.log(rootnode)
		// return;

		import( chrome.runtime.getURL('../templates/keyboardShortcutPopup.js') ).then(module => {
			console.log(module.render);
			console.log(module.staticRenderFns);

			let vue = new Vue({
				...module,

				el: rootnode,
				data: function() {
					return {
						keybindDisabledMessage : 'hello keybindDisabledMessage',
						keybindToggleRecDiag : 'hello keybindToggleRecDiag',
						keybindRestorePreviousSession : 'hello keybindRestorePreviousSession',
						keybindOpenQuickAccess : 'hello keybindOpenQuickAccess'
					}
				},
				methods: {}
			});

			// console.log(rootnode, vue);

			// if(callback) callback();

		});
	}

	/*

	function hidePopup() {
		if(popupVisible) {
			popupNode.classList.add('hidden')
			popupVisible = false;
		}
	}

	function prettyKeyCombo(keyarr) {
		
		if(keyarr.length === 1 && keyarr[0] === '') {
			return '<span class="key disabled">disabled</span>'
		} else {
			return '<span class="key">' + keyarr.join('</span> <span class="key">') + '</span>';
		}
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

			var disabledMsg = '';
			if(!options.get('keybindEnabled')) {
				disabledMsg = '<p class="error">You have disabled keyboard shortcuts in the options.</p>';
			}

			terafm.ui.inject({
				path: 'templates/keyboardShortcutPopup.tpl',
				returnNode: '#keyboardShortcutPopup'
			}, {
				'{{keybindDisabledMessage}}' : disabledMsg,
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

	*/

})(terafm.keyboardShortcutController, terafm.db, terafm.editableManager, terafm.initHandler, terafm.options, terafm.keyboardShortcuts, terafm.toast);