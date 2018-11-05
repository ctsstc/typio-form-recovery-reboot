window.terafm = window.terafm || {};

terafm.keyboardShortcutController = {};

(function(keyboardShortcutController, db, editableManager, initHandler, options, keyboardShortcuts) {
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
				var sess = db.getLatestSession();

				if(sess.length) {
					terafm.defaults.restore();
					sess.restore({flash: true});
					terafm.toastController.create('Restoring previous session')
				} else {
					terafm.toastController.create('Nothing to restore')
				}

			});
		}
	});

	function showPopup() {
		build(function() {
			vue.show();
		});
	}

	function build(callback) {
		if(vue) return callback();

		terafm.ui.inject({
			html: '<div id="tmp-holder"></div>',
			returnNode: '#tmp-holder',
			loadIcons: true
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
		vue = new Vue({
			'@import-vue keyboardShortcutPopup':0,

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
				show: function() {
					document.activeElement.blur();
					vue.visible = true;
				},
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
	}

})(terafm.keyboardShortcutController, terafm.db, terafm.editableManager, terafm.initHandler, terafm.options, terafm.keyboardShortcuts);