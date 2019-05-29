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
			...{render: function render() {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"modal-container",class:{'hidden': !_vm.visible},attrs:{"id":"keyboardShortcutPopup"},on:{"click":function($event){_vm.backgroundClickHide($event)}}},[_c('div',{staticClass:"modal"},[_c('div',{staticClass:"modal-header"},[_c('p',{staticClass:"title"},[_vm._v("Typio Keyboard Shortcuts")]),_vm._v(" "),_c('button',{staticClass:"close icon-close",on:{"click":function($event){_vm.closeModal()}}})]),_vm._v(" "),_c('div',{staticClass:"modal-content"},[(_vm.isDisabled)?_c('p',{staticClass:"error"},[_vm._v("You have disabled keyboard shortcuts in the options.")]):_vm._e(),_vm._v(" "),_c('div',{staticClass:"combo-group"},[_c('div',{staticClass:"combo"},[_c('p',{staticClass:"description"},[_vm._v("Open/Close recovery dialog")]),_vm._v(" "),_c('p',{staticClass:"keys",domProps:{"innerHTML":_vm._s(_vm.keybindToggleRecDiag)}})]),_vm._v(" "),_c('div',{staticClass:"combo"},[_c('p',{staticClass:"description"},[_vm._v("Restore previous session")]),_vm._v(" "),_c('p',{staticClass:"keys",domProps:{"innerHTML":_vm._s(_vm.keybindRestorePreviousSession)}})])]),_vm._v(" "),_c('div',{staticClass:"combo-group"},[_c('div',{staticClass:"combo"},[_c('p',{staticClass:"description"},[_vm._v("Open Quick Restore for focused field")]),_vm._v(" "),_c('p',{staticClass:"keys",domProps:{"innerHTML":_vm._s(_vm.keybindOpenQuickAccess)}})]),_vm._v(" "),_vm._m(0),_vm._v(" "),_vm._m(1)]),_vm._v(" "),_c('div',{staticStyle:{"text-align":"center"}},[_c('a',{on:{"click":function($event){_vm.openSettings();}}},[_vm._v("Change keyboard combinations in options")])])])])])}, staticRenderFns: [function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"combo"},[_c('p',{staticClass:"description"},[_vm._v("Navigate items")]),_vm._v(" "),_c('p',{staticClass:"keys"},[_c('span',{staticClass:"key"},[_vm._v("▲")]),_vm._v(" "),_c('span',{staticClass:"key"},[_vm._v("▼")])])])},function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"combo"},[_c('p',{staticClass:"description"},[_vm._v("Select item")]),_vm._v(" "),_c('p',{staticClass:"keys"},[_c('span',{staticClass:"key"},[_vm._v("Space")])])])}]},

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