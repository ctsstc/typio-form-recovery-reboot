import initHandler from '../../modules/initHandler';
import Options from '../../modules/options/options';
import keyboardShortcuts from '../../modules/keyboardShortcuts';
import db from '../../modules/db/db';
import EditableDefaults from '../../modules/EditableDefaults';
import ui from '../../modules/ui';
import toastController from './toastController';
import KeyboardShortcutPopup from '../../vue/content/KeyboardShortcutPopup.vue';
import Vue, { h } from 'vue';

let keyboardShortcutController = {};

let vue;

keyboardShortcutController.showShortcutDialog = function() {
	showPopup();
}

// Open call popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.action === 'showKeyboardShortcuts') showPopup();
});

initHandler.onInit(function() {

	if(Options.get('keybindEnabled')) {

		const keybindRestorePreviousSession = Options.get('keybindRestorePreviousSession');
		if(keybindRestorePreviousSession.length) keyboardShortcuts.on(keybindRestorePreviousSession, function() {

			let sess;

			// First try and get prev sess for currently focused editable
			const currFocusEl = window.terafm.focusedEditable;
			if(currFocusEl) {
				const sessList = db.getSessionsContainingEditable(currFocusEl.id, 10);
				sess = sessList.getArray().pop();
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

				EditableDefaults.restore();
				sess.restore({ flash: true, clone: true }, db);
				toastController.create('Restoring previous session')
			} else {
				toastController.create('Nothing to restore')
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

	ui.inject({
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
		el: rootnode,
		render() { return h(KeyboardShortcutPopup) },
	});
	vue = vue.$children[0];

	if(callback) callback();
}

export default keyboardShortcutController;