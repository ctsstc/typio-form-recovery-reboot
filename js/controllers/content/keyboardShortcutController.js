window.terafm = window.terafm || {};

terafm.keyboardShortcutController = {};

(function(keyboardShortcutController, db, editableManager, initHandler, options, keyboardShortcuts, toast) {
	// 'use strict';

	let vue;

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
			vue.visible = true;
		})
	}

	function build(callback) {
		if(vue) return callback();

		terafm.ui.inject({
			html: '<div id="tmp-holder"></div>',
			returnNode: '#tmp-holder'
		}, function(rootnode) {
			makeVue(rootnode, callback);

			keyboardShortcuts.on(['Escape'], hide);
			function hide(e) {
				if(vue.visible) {
					if(e.preventDefault) {e.preventDefault(); e.stopPropagation();}
					vue.closeModal();
				}
			}
		});
	}

	function makeVue(rootnode, callback) {
		import( chrome.runtime.getURL('../templates/keyboardShortcutPopup.js') ).then(module => {

			vue = new Vue({
				...module,

				el: rootnode,
				data: function() {
					return {
						visible: true,
						isDisabled : false,
						keybindToggleRecDiag : 'false',
						keybindRestorePreviousSession : 'false',
						keybindOpenQuickAccess : 'false'
					}
				},
				mounted: function() {
					this.fetchOptions();
				},
				methods: {
					fetchOptions: function() {
						this.isDisabled = !options.get('keybindEnabled'),
						this.keybindToggleRecDiag = terafm.keyboardShortcuts.printableKey(options.get('keybindToggleRecDiag')),
						this.keybindRestorePreviousSession = terafm.keyboardShortcuts.printableKey(options.get('keybindRestorePreviousSession')),
						this.keybindOpenQuickAccess = terafm.keyboardShortcuts.printableKey(options.get('keybindOpenQuickAccess'))
					},
					openSettings: function() {
						chrome.runtime.sendMessage({action: 'openSettings'});
					},
					closeModal: function() {
						this.visible = false;
					},
					backgroundClickHide: function(e) {
						if(e.path[0].classList.contains('modal-container')) this.closeModal();
					},
				}
			});

			if(callback) callback();

		});
	}

})(terafm.keyboardShortcutController, terafm.db, terafm.editableManager, terafm.initHandler, terafm.options, terafm.keyboardShortcuts, terafm.toast);