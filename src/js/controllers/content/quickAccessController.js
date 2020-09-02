import Options from '../../modules/options/options';
import initHandler from '../../modules/initHandler';
import ui from '../../modules/ui';
import db from '../../modules/db/db';
import Events from '../../modules/Events';
import keyboardShortcuts from '../../modules/keyboardShortcuts';
import toastController from './toastController';
import blockController from './blockController';
import Cache from '../../modules/Cache';
import QuickAccessPopup from '../../vue/content/QuickAccessPopup.vue';
import recoveryDialogController from './recoveryDialogController';
import Vue from 'vue';

let controller = {};
let vue;
let qaOpenedFor;

initHandler.onInit(function() {
	if(Options.get('keybindEnabled')) {
		keyboardShortcuts.on(Options.get('keybindOpenQuickAccess'), function(e) {
			if(e.preventDefault) {e.preventDefault(); e.stopPropagation();}

			// Only pass editable
			show(window.terafm.focusedEditable);
		});
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.action === 'openQuickAccess') {
		if(window.terafm.isBlocked) return blockController.warn();
		show(window.terafm.focusedEditable);
	}
});

controller.show = (...args) => show(...args);

function show(editable, coord) {
	if(!window.terafm.focusedEditable) return toastController.create('Typio could not detect a focused input field. <a target="_blank" href="'+ chrome.runtime.getURL('html/app.html#/faq#error-input-not-found') +'">Read more.</a>');
	
	if(editable.isContentEditable()) {
		recoveryDialogController.open();
		toastController.create('Cannot open Quick Restore Popup for selected input type (contentEditable)');
		return;
	}

	Cache.wipeCache();

	qaOpenedFor = editable;

	build(function() {
		vue.showAndPopulate(editable, coord);
	});
}

function build(callback) {
	if(vue) return callback && callback();

	ui.inject({
		html: '<div id="tmp-qa-holder"></div>',
		returnNode: '#tmp-qa-holder',
		loadIcons: true
	}, function(rootnode) {
		makeVue(rootnode, () => {
			if(callback) callback();
			setupKeyNav();
		});
	});
}

function makeVue(rootnode, callback) {

	vue = new Vue({
		el: rootnode,
		render(h) { return h(QuickAccessPopup) },
	});

	vue.$on('afterRestore', () => {
		console.log('after restore!');
	})

	vue = vue.$children[0];

	vue.$on('afterRestore', (x) => {
		qaOpenedFor.el.focus();
	});

	Events.on('focus', () => {
		if(window.terafm.isRestoring !== true) {
			vue.abort();
		}
	})

	if(callback) callback();
}

function setupKeyNav() {

	Events.on('mousedown', () => {
		if(vue.isVisible) {
			vue.abort();
		}
	});
	vue.$el.addEventListener('mousedown', (e) => e.stopPropagation());
	
	keyboardShortcuts.on(['ArrowDown'], function(e) {sel('next', e)});
	keyboardShortcuts.on(['ArrowRight'], function(e) {sel('next', e)});
	keyboardShortcuts.on(['ArrowUp'], function(e) {sel('prev', e)});
	keyboardShortcuts.on(['ArrowLeft'], function(e) {sel('prev', e)});
	
	function sel(direction, e) {
		if(vue.isVisible) {
			if(e.preventDefault) {e.preventDefault(); e.stopPropagation();}

			var sels = Array.prototype.slice.call(vue.$el.querySelectorAll('.selectable:not(.keyboard-ignore)')),
				currSel = vue.$el.querySelector('.selectable.selected'),
				currI = sels.indexOf(currSel),
				newSel;

			if(direction === 'prev') {
				if(currI < 1) {
					newSel = sels[sels.length-1]
				} else {
					newSel = sels[currI-1]
				}

			} else if(direction === 'next') {
				if(currI === -1 || currI === sels.length-1) {
					newSel = sels[0]
				} else {
					newSel = sels[currI+1]
				}
			}


			if(currSel) currSel.dispatchEvent(new Event('mouseleave'));
			newSel.dispatchEvent(new Event('mouseenter'));
		}
	}

	keyboardShortcuts.on(['Escape'], () => {
		if(vue.isVisible) {
			vue.abort();
		}
	});
	keyboardShortcuts.on([' '], (e) => {
		if(vue.isVisible && vue.currSel) {
			if(e.preventDefault) e.preventDefault();
			vue.currSel.commit();
		}
	});

	keyboardShortcuts.on(['shift', 'Delete'], () => {
		if(vue.isVisible && vue.currSel) {

			if(vue.currSel.isSess) {
				const entries = vue.currSel.entry.session.getEntries();
				db.deleteEntries(entries);
			} else {
				db.deleteEntry(vue.currSel.entry);
			}

			const liEl = vue.currSel.$el;
			liEl.outerHTML = '';
		}
	})
}


function getSelectable(el) {
	if(el.classList.contains('selectable')) return el;
	else return el.closest('.selectable');
}

export default controller;