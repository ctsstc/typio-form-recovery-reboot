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
			...{render: function render() {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"modal-container",class:{'hidden': !_vm.visible},attrs:{"id":"recovery-dialog"},on:{"click":function($event){_vm.backgroundClickHide($event)}}},[_c('div',{staticClass:"modal"},[_c('div',{staticClass:"header"},[_c('div',{staticClass:"top-bar"},[_c('p',[_vm._v("Typio Form Recovery")]),_vm._v(" "),_c('button',{staticClass:"icon-close",on:{"click":function($event){_vm.hide()}}})]),_vm._v(" "),_c('div',{staticClass:"primary"},[_c('div',{staticClass:"left"},[_vm._v(" Recover "+_vm._s(_vm.hostname)+" ")]),_vm._v(" "),_c('button',{staticClass:"toolbar-icon",on:{"click":function($event){_vm.disableSite()}}},[_c('span',{staticClass:"icon-block"}),_vm._v("Disable on this site")]),_vm._v(" "),_c('button',{staticClass:"toolbar-icon",on:{"click":function($event){_vm.openOptions()}}},[_c('span',{staticClass:"icon-gear"}),_vm._v("Open settings")])])]),_vm._v(" "),_c('div',{staticClass:"panes"},[_c('div',{staticClass:"left"},[_c('div',{staticClass:"header"},[_c('div',{staticClass:"filter-box"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.filterText),expression:"filterText"}],staticClass:"filter-input typioIgnoreField",attrs:{"type":"text","placeholder":"Filter entries"},domProps:{"value":(_vm.filterText)},on:{"input":[function($event){if($event.target.composing){ return; }_vm.filterText=$event.target.value},function($event){_vm.populate(true)}]}}),_vm._v(" "),_c('div',{staticClass:"chk-label"},[_c('div',{staticClass:"pretty-chk"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.filterShowTextOnly),expression:"filterShowTextOnly"}],staticClass:"typioIgnoreField",attrs:{"type":"checkbox","id":"chk-hide-small-entries"},domProps:{"checked":Array.isArray(_vm.filterShowTextOnly)?_vm._i(_vm.filterShowTextOnly,null)>-1:(_vm.filterShowTextOnly)},on:{"change":[function($event){var $$a=_vm.filterShowTextOnly,$$el=$event.target,$$c=$$el.checked?(true):(false);if(Array.isArray($$a)){var $$v=null,$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.filterShowTextOnly=$$a.concat([$$v]))}else{$$i>-1&&(_vm.filterShowTextOnly=$$a.slice(0,$$i).concat($$a.slice($$i+1)))}}else{_vm.filterShowTextOnly=$$c}},function($event){_vm.updateOptsfilterShowTextOnly()}]}}),_vm._v(" "),_c('div',{staticClass:"fake-chk"})]),_vm._v(" "),_c('label',{attrs:{"for":"chk-hide-small-entries"}},[_vm._v("Hide non-text entries")])]),_vm._v(" "),_c('span',{staticClass:"icon icon-search"})]),_vm._v(" "),(_vm.filteredCount)?_c('p',{staticClass:"filter-warning"},[_vm._v(_vm._s(_vm.filteredCount)+" entries hidden - "),_c('a',{on:{"click":function($event){_vm.resetFilters(); _vm.populate(true);}}},[_vm._v("clear filters")])]):_vm._e()]),_vm._v(" "),_c('div',{staticClass:"session-data"},[(_vm.sesslist && _vm.sesslist.length < 1)?[_c('p',[_vm._v("No entries found.")])]:_vm._e(),_vm._v(" "),(!_vm.sesslist)?[_c('p',[_vm._v("Loading entries...")])]:_vm._e(),_vm._v(" "),(_vm.sesslist !== false)?_c('div',[_vm._l((_vm.sesslist.getArray().reverse()),function(sess){return [(sess.length)?_c('p',{staticClass:"date-stamp"},[_vm._v(_vm._s(sess.prettyDate()))]):_vm._e(),_vm._v(" "),(sess.length)?_c('ul',{staticClass:"card-1"},_vm._l((sess.entries),function(entry){return _c('li',{attrs:{"data-session-id":entry.sessionId,"data-editable-id":entry.editableId},on:{"click":function($event){_vm.setEntry($event)}}},[_c('p',{domProps:{"innerHTML":_vm._s(entry.getPrintableValue({truncate: 300}))}}),_vm._v(" "),_c('div',{staticClass:"meta"},[_c('div',{staticClass:"left"},[(entry.hasEditable())?_c('span',{staticClass:"status ok",attrs:{"title":"This input entry can be automatically restored to its original input field."}},[_vm._v("Input field found")]):_vm._e(),_vm._v(" "),(!entry.hasEditable())?_c('span',{staticClass:"status bad",attrs:{"title":"The input field the entry was typed in cannot be found on the current page. Either the field does not exist, or it cannot be found in the same place (path has changed). You can manually restore the entry by copying it."}},[_vm._v("Cannot be auto-restored")]):_vm._e()]),_vm._v(" "),_c('div',{staticClass:"right"},[_c('a',{staticClass:"delete",class:_vm.delConfirmEntry === entry ? 'confirm' : '',on:{"click":function($event){_vm.deleteEntry($event)}}},[_vm._v(_vm._s(_vm.delConfirmEntry === entry ? 'Click to confirm' : 'Delete'))])])])])})):_vm._e()]})],2):_vm._e()],2)]),_vm._v(" "),_c('div',{staticClass:"right"},[_c('div',{staticClass:"page page-default",class:[(_vm.page === 'default' || !_vm.page) ? 'page-current' : '' ]},[_c('div',{staticClass:"center"},[_c('span',{staticClass:"icon icon-cloud"}),_vm._v(" "),_c('p',{staticClass:"bold"},[_vm._v("Select an entry to the left.")]),_vm._v(" "),_c('p',[_vm._v("Typio has saved "),_c('b',[_vm._v(_vm._s(_vm.stats.countTotEntries)+" entries")]),_vm._v(" in "),_c('b',[_vm._v(_vm._s(_vm.stats.countTotSessions)+" sessions")]),_vm._v(" with"),_c('br'),_vm._v("a total size of "),_c('b',[_vm._v(_vm._s(_vm.stats.countTotSize)+" megabytes")]),_vm._v(" for this domain.")]),_vm._v(" "),_c('p',[_vm._v("Psst. Did you know about the "),_c('a',{on:{"click":function($event){_vm.openKeyboardShortcuts()}}},[_vm._v("keyboard shortcuts")]),_vm._v("?")])])]),_vm._v(" "),(_vm.currEntry)?_c('div',{staticClass:"page page-entry",class:[(_vm.page === 'entry') ? 'page-current' : '' ]},[_c('div',{staticClass:"entry-header"},[(_vm.currEntry.hasEditable())?[_c('button',{staticClass:"btn btn-primary",on:{"click":function($event){_vm.restoreSession()}}},[_vm._v("Restore session")]),_vm._v(" "),_c('button',{staticClass:"btn btn-flat",on:{"click":function($event){_vm.restoreEntry()}}},[_vm._v("Restore only this")])]:_vm._e(),_vm._v(" "),(_vm.currEntry.type === 'contenteditable')?[_c('div',{staticClass:"btn-drop-container",staticStyle:{"float":"right"},attrs:{"onclick":"this.classList.toggle('open')"}},[_c('button',{staticClass:"btn",class:[!_vm.currEntry.hasEditable() ? 'btn-primary' : 'btn-flat' ]},[_vm._v("Copy▾")]),_vm._v(" "),_c('ul',{staticClass:"btn-drop"},[_c('li',{on:{"click":function($event){_vm.copyEntry('plaintext')}}},[_vm._v("Copy plain text")]),_vm._v(" "),_c('li',{on:{"click":function($event){_vm.copyEntry('formatting')}}},[_vm._v("Copy with formatting")])])])]:[_c('button',{staticClass:"btn",class:[!_vm.currEntry.hasEditable() ? 'btn-primary' : 'btn-flat' ],staticStyle:{"float":"right"},on:{"click":function($event){_vm.copyEntry('plaintext')}}},[_vm._v("Copy")])],_vm._v(" "),(!_vm.currEntry.hasEditable())?_c('p',{staticClass:"message-warn"},[_c('span',{staticClass:"icon-info"}),_vm._v(" This entry cannot be restored automatically. "),_c('a',{attrs:{"target":"_blank","href":_vm.noAutoRestoreHelpLink}},[_vm._v("Why?")])]):_vm._e()],2),_vm._v(" "),_c('div',{staticClass:"entry-text card-1",attrs:{"id":"entry-text"},domProps:{"innerHTML":_vm._s(_vm.currEntry.getPrintableValue({retainLineBreaks: true}))}}),_vm._v(" "),_c('div',{staticClass:"entry-meta card-1",attrs:{"id":"entry-path"}},[_vm._v(" "+_vm._s(_vm.currEntry.path)+"   "+_vm._s(_vm.currEntry.type)+" ")])]):_vm._e()])])])])}},
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

						this.stats.countTotSessions = this.sesslist.length;
						this.stats.countTotEntries = this.sesslist.countEntries();
						terafm.db.getDomainSize().then(bytes => this.stats.countTotSize = Number(bytes/1024/1024).toFixed(2));

						if(this.filterShowTextOnly || this.filterText.length > 1) {
							this.sesslist = this.sesslist.filterEntries(entry => {
								if(this.filterText.length > 1) {
									if(entry.value.toLowerCase().indexOf(this.filterText.toLowerCase()) === -1) return null;
								}

								if(this.filterShowTextOnly) {
									if(!entry.isTextType()) return null;
								}
							});
							this.filteredCount = this.stats.countTotEntries - this.sesslist.countEntries();
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
				},
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

				delConfirmItem: false,

				stats: {
					countTotSessions: 0,
					countTotEntries: 0,
					countTotSize: 0
				}
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