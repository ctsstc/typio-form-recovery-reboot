import KeyboardShortcuts from '../../modules/keyboardShortcuts';
import initHandler from '../../modules/initHandler';
import ui from '../../modules/ui';
import Options from '../../modules/options/options';
import blockController from './blockController';
import RecoveryDialog from '../../vue/content/RecoveryDialog.vue';
import Vue from "vue";

let recoveryDialogController = {};

let vue;

// Key comobo to open/close diag
initHandler.onInit(function() {
	if(Options.get('keybindEnabled')) {
		KeyboardShortcuts.on(Options.get('keybindToggleRecDiag'), function() {
			if(!vue) return build();
			if(vue.visible) {
				vue.hide();
			} else {
				vue.show();
			}
		});
	}

});
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.action === 'openRecoveryDialog') show();
});

recoveryDialogController.open = () => show();

function show() {
	if(terafm.isBlocked) return blockController.warn();
	if(vue) {
		vue.show();
	} else {
		build();
	}
}

function build(callback) {
	if(vue) return callback && callback();

	ui.inject({
		html: '<div id="tmp-dialog-holder"></div>',
		returnNode: '#tmp-dialog-holder',
		loadIcons: true
	}, function(rootnode) {
		makeVue(rootnode, callback);
	});
}

function makeVue(rootnode, callback) {

	vue = new Vue({
		el: rootnode,
		render(h) { return h(RecoveryDialog) },
	});
	vue = vue.$children[0];

	KeyboardShortcuts.on(['Escape'], function() {
		vue.hide();
	});

	if(callback) callback();
}

export default recoveryDialogController;