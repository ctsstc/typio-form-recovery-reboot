window.terafm = window.terafm || {};
terafm.recoveryDialogController = {};

(function(recoveryDialogController, recoveryDialog, db, help, editableManager, options, keyboardShortcuts, initHandler) {
	'use strict';

	let vue;

	// Key comobo to open/close diag
	initHandler.onInit(function() {
		if(options.get('keybindEnabled')) {
			keyboardShortcuts.on(options.get('keybindToggleRecDiag'), function() {
				if(!vue) return build();
				if(vue.visible) {
					vue.hide();
				} else {
					vue.show();
				}
			});
		}

		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			if(request.action === 'openRecoveryDialog') show();
		});
	})

	function show() {
		db.fetch().then(() => {
			if(vue) {
				vue.show();
			} else {
				build((node) => vue.show() );
			}
		})
	}

	function build(callback) {
		if(!vue) {
			terafm.ui.inject({
				path: 'templates/dialog.tpl',
				returnNode: '#recovery-dialog'
			}, function(rootnode) {
				makeVue(rootnode);
				if(callback) callback();

			});
		} else {
			if(callback) callback();
		}
	}

	function makeVue(rootnode) {

		vue = new Vue({
			el: rootnode,
			methods: {
				hide: function() {
					this.visible = false;
				},
				backgroundClickHide: function(e) {
					if(e.path[0].classList.contains('modal-container')) this.hide();
				},
				show: function() {
					this.visible = true;
					this.populate();
				},
				setEntry: function(e) {
					let target = e.path[0];
					if(!target.matches('li')) target = target.closest('li');

					this.currEntry = this.sesslist.getEntry(target.dataset.sessionId, target.dataset.editableId);
					this.page = 'entry';

					if(this.selectedListItem) this.selectedListItem.classList.remove('selected');
					this.selectedListItem = target;
					this.selectedListItem.classList.add('selected');
				},

				// Callback for failures?
				restoreSession: function() {
					if(!this.currEntry) return;
					this.currEntry.getSession().restore({flash: true});
					terafm.toast.create('Session restored.');
					this.hide();
				},
				restoreEntry: function() {
					if(!this.currEntry) return;
					this.currEntry.restore({flash: true});
					terafm.toast.create('Entry restored.');
					this.hide();
				},

				populate: function() {
					this.currEntry = null;
					this.page = 'default';

					this.sesslist = db.getSessions();

					if(this.filterSmallEntries || this.filterText.length > 2) {
						var defCount = this.sesslist.countEntries();
						this.sesslist = this.sesslist.filterEntries(entry => {
							if(entry.obj.value.toLowerCase().indexOf(this.filterText.toLowerCase()) === -1 || entry.obj.value.length < 6) return null;
						});
						this.filteredCount = defCount - this.sesslist.countEntries();
					} else {
						this.filteredCount = 0;
					}

					this.totalEntries = this.sesslist.countEntries();

					this.$el.querySelector('.session-data').scrollTop = 0;
				},
				updateOptsFilterSmallEntries: function() {
					this.populate();
					options.set('hideSmallEntries', this.filterSmallEntries);
				},

				deleteEntry: function(e) {
					let target = e.path[0];
					if(!target.matches('.delete')) target = target.closest('.delete');

					if(!target.classList.contains('confirm')) {
						target.classList.add('confirm');
						target.querySelector('.text').innerText = 'Click to confirm';
						
						setTimeout(() => {
							target.classList.remove('confirm');
							target.querySelector('.text').innerText = 'Delete';
						}, 4000);
					} else {
						let li = target.closest('li'),
							ul = li.closest('ul');

						this.sesslist.getEntry(li.dataset.sessionId, li.dataset.editableId).delete();

						ul.removeChild(li);

						if(ul.children.length === 0) {
							let datestamp = ul.previousElementSibling;
							if(datestamp.classList.contains('date-stamp')) {
								datestamp.parentElement.removeChild(datestamp);
							}
							ul.parentElement.removeChild(ul);
						}
					}
				},

				openKeyboardShortcuts: function() {
					this.hide();
					terafm.keyboardShortcutController.showShortcutDialog();
				},

				copyEntry: function(format) {
					if(!this.currEntry) return;

					if(format === 'plaintext') {
						terafm.help.copyToClipboard(this.currEntry.getValue({encode: true, trim: true}));
						terafm.toast.create('Copied plaintext to clipboard.');
					} else if(format === 'formatting') {
						terafm.help.copyToClipboard(this.currEntry.getValue({trim: true}));
						terafm.toast.create('Copied text with formatting to clipboard.');
					}

				}
			},
			data: {
				visible: true,
				hostname: window.location.hostname,
				page: 'default',
				selectedListItem: null,

				sesslist: new terafm.SessionList(), // Todo: fix
				currEntry: null,

				totalEntries: 0,
				filteredCount: 0,
				filterSmallEntries: options.get('hideSmallEntries'),
				filterText: '',
			}
		});
		console.log(vue);


		keyboardShortcuts.on(['Escape'], function() {
			vue.hide();
		});

		// diagRootNode.addEventListener('click', function(e) {
		// 	let target = e.target;
			
		// 	console.log(target);

		// 	if(target.matches('.session-data ul > li') || target.closest('.session-data ul > li')) {
		// 		if(target.nodeName.toLowerCase() !== 'li') target = target.closest('.session-data ul > li');
		// 		clickListItem(target);

		// 	} else if(target.matches('[data-action="close"]') || target.classList.contains('modal-container')) {
		// 		recoveryDialog.hide();
			
		// 	} else if(target.matches('[data-action="delete-entry"]') || target.closest('[data-action="delete-entry"]')) {
		// 		if(!target.matches('[data-action="delete-entry"]')) target = target.closest('[data-action="delete-entry"]');
		// 		console.log(target)
		// 		clickDeleteLink(target);
		// 	}
		// });

		// function clickDeleteLink() {
		// 	if(target.classList.contains('confirm')) {
		// 		target.closest('ul').removeChild(target.closest('li'));
		// 	} else {
		// 		target.querySelector('.text').innerHTML = 'Click to confirm deletion';
		// 		target.classList.add('confirm');
		// 	}
		// }


		// function clickListItem() {
		// 	remSel();
		// 	target.classList.add('selected');
		// 	let data = target.dataset;
		// 	currentry = sessionlist.getEntry(data.sessionId, data.editableId);
		// 	recoveryDialog.setEntry(currentry);
		// }

		// let filterfunc = terafm.help.debounce(function(e) {
		// 	let value = e.path[0].value,
		// 		data = db.getSessions(),
		// 		filterCount = 0;

		// 	if(value.length) {
		// 		data = data.filterEntries(function(entry) {
		// 			if(entry.obj.value.indexOf(value) === -1) return null;
		// 		});
		// 		filterCount = sessionlist.countEntries() - data.countEntries();
		// 	}

		// 	recoveryDialog.populate(data, filterCount);
		// }, 500);
		// diagRootNode.querySelector('input[type=text]').addEventListener('input', filterfunc);
	}

	// function remSel() {
	// 	let cs = diagRootNode.querySelector('.session-data li.selected');
	// 	if(cs) cs.classList.remove('selected');
	// }

})(terafm.recoveryDialogController, terafm.recoveryDialog, terafm.db, terafm.help, terafm.editableManager, terafm.options, terafm.keyboardShortcuts, terafm.initHandler);