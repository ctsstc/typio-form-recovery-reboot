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

			const keybindRestorePreviousSession = options.get('keybindRestorePreviousSession');
			if(keybindRestorePreviousSession.length) keyboardShortcuts.on(keybindRestorePreviousSession, function() {

				let sess;

				// First try and get prev sess for currently focused editable
				const currFocusEl = terafm.focusedEditable;
				if(currFocusEl) {
					const sessList = terafm.db.getSessionsContainingEditable(currFocusEl.id, 1);
					sess = sessList.sessions[Object.keys(sessList.sessions)[0]];
					console.log(sess);
				}

				// Fall back to global prev sess
				if(!sess) {
					sess = db.getLatestSession();
				}

				if(sess.length) {
					// Some editors have issues with programmatic manipulation when the editor has focus
					// Focus cannot always be restored (in iframes or shadow doms), but this is probably not an issue.
					const focusEl = document.activeElement;
					document.activeElement.blur();
					setTimeout(() => {
						focusEl.focus();
					}, 200);

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
			'@import-vue content/keyboardShortcutPopup':0,
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
