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

	});
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'openRecoveryDialog') show();
	});

	recoveryDialogController.open = () => show();

	function show() {
		if(terafm.isBlocked) return terafm.blockController.warn();
		if(vue) {
			vue.show();
		} else {
			build();
		}
	}

	function build(callback) {
		if(vue) return callback && callback();

		terafm.ui.inject({
			html: '<div id="tmp-dialog-holder"></div>',
			returnNode: '#tmp-dialog-holder',
			loadIcons: true
		}, function(rootnode) {
			makeVue(rootnode, callback);
		});
	}

	function makeVue(rootnode, callback) {
		vue = new Vue({
			'@import-vue dialog':0,
			el: rootnode,
			methods: {
				hide: function() {
					this.visible = false;
				},
				backgroundClickHide: function(e) {
					if(e.path[0].classList.contains('modal-container')) this.hide();
				},
				show: function() {
					if(this.visible) return;
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
				setDefaultPage: function() {
					this.currEntry = null;
					this.page = 'default';
					if(this.selectedListItem) {
						this.selectedListItem.classList.remove('selected');
						this.selectedListItem = null;
					}
				},

				// Callback for failures?
				restoreSession: function() {
					if(!this.currEntry) return;
					terafm.defaults.restore();
					this.currEntry.getSession().restore({flash: true});
					terafm.toastController.create('Session restored.');
					this.hide();
				},
				restoreEntry: function() {
					if(!this.currEntry) return;
					terafm.defaults.restore();
					this.currEntry.restore({flash: true});
					terafm.toastController.create('Entry restored.');
					this.hide();
				},

				populate: function(opts = {scrollTop: false}) {
					this.setDefaultPage();

					db.fetch().then(() => {
						this.sesslist = db.getSessions();

						if(this.filterShowTextOnly || this.filterText.length > 1) {
							var defCount = this.sesslist.countEntries();
							this.sesslist = this.sesslist.filterEntries(entry => {
								if(this.filterText.length > 1) {
									if(entry.value.toLowerCase().indexOf(this.filterText.toLowerCase()) === -1) return null;
								}

								if(this.filterShowTextOnly) {
									if(!entry.isTextType()) return null;
								}
							});
							this.filteredCount = defCount - this.sesslist.countEntries();
						} else {
							this.filteredCount = 0;
						}
						
						if(opts.scrollTop) this.scrollTop();
					});
				},
				scrollTop: function() {
					this.$el.querySelector('.session-data').scrollTop = 0;
				},
				updateOptsfilterShowTextOnly: function() {
					this.populate();
					options.set('hideSmallEntries', this.filterShowTextOnly);
				},
				resetFilters: function() {
					this.filterText = '';
					this.filterShowTextOnly = false;
				},

				deleteEntry: function(e) {
					let target = e.path[0], li, entry;
					if(!target.matches('.delete')) target = target.closest('.delete');
					li = target.closest('li');
					entry = this.sesslist.getEntry(li.dataset.sessionId, li.dataset.editableId);

					if(!entry) return;
					clearTimeout(this.tmpDelTimeout);

					if(this.delConfirmEntry === entry) {
						this.sesslist.deleteEntry(li.dataset.sessionId, li.dataset.editableId, () => {
							this.populate();
							this.delConfirmEntry = false;
						});

					} else {
						this.delConfirmEntry = entry;
						this.$forceUpdate();

						this.tmpDelTimeout = setTimeout(() => {
							this.delConfirmEntry = false;
							this.$forceUpdate();
						}, 4000);
					}

					e.stopPropagation();
					return;



					if(!target.classList.contains('confirm')) {
						target.classList.add('confirm');
						target.querySelector('.text').innerText = 'Click to confirm';
						
						setTimeout(function() {
							target.classList.remove('confirm');
							target.querySelector('.text').innerText = 'Delete';
						}, 4000);
					} else {
						let li = target.closest('li');

						this.sesslist.deleteEntry(li.dataset.sessionId, li.dataset.editableId, () => {
							this.populate();

							// Vue will re-use other elements and change the text in them
							// instead of creating new ones, so the make sure the .confirm class
							// is removed if the li element was re-used
							let delLink = li && li.querySelector('.meta .delete.confirm');
							if(delLink) delLink.classList.remove('confirm');
						});
					}
				},

				openKeyboardShortcuts: function() {
					this.hide();
					terafm.keyboardShortcutController.showShortcutDialog();
				},

				copyEntry: function(format) {
					if(!this.currEntry) return;

					if(format === 'plaintext') {
						terafm.help.copyToClipboard(this.currEntry.getValue({stripTags: true, trim: true}));
						terafm.toastController.create('Copied plaintext to clipboard.');

					} else if(format === 'formatting') {
						terafm.help.copyToClipboard(this.currEntry.getValue({trim: true}));
						terafm.toastController.create('Copied text with formatting to clipboard.');
					}

				},

				openOptions: function() {
					chrome.runtime.sendMessage({action: 'openSettings'});
				},
				disableSite: function() {
					if(terafm.blockController.block()) this.hide();
				}
			},
			data: {
				visible: true,
				hostname: window.location.hostname,
				page: 'default',
				selectedListItem: null,

				sesslist: false,
				currEntry: null,

				filteredCount: 0,
				filterShowTextOnly: options.get('hideSmallEntries'),
				filterText: '',
				noAutoRestoreHelpLink: chrome.runtime.getURL('html/faq.html#no-auto-restore'),

				delConfirmItem: false
			},
			mounted: function() {
				document.activeElement.blur();
				this.populate();
			}
		});


		keyboardShortcuts.on(['Escape'], function() {
			vue.hide();
		});

		if(callback) callback();
	}

})(terafm.recoveryDialogController, terafm.recoveryDialog, terafm.db, terafm.help, terafm.editableManager, terafm.options, terafm.keyboardShortcuts, terafm.initHandler);