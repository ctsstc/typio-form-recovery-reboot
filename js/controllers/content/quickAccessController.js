window.terafm = window.terafm || {};
terafm.quickAccessController = {};

(function(controller, initHandler, options, keyboardShortcuts) {

	let vue;

	initHandler.onInit(function() {
		if(options.get('keybindEnabled')) {
			keyboardShortcuts.on(options.get('keybindOpenQuickAccess'), function(e) {
				if(e.preventDefault) {e.preventDefault(); e.stopPropagation();}

				// Only pass editable
				// Todo: Toggle show
				show(terafm.focusedEditable);
			});
		}
	});

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'openQuickAccess') {

			// Also pass right click mouse coord
			show(terafm.focusedEditable);
		}
	});

	controller.show = (...args) => show(...args);

	function show(editable, coord) {
		build(function() {
			vue.showAndPopulate(editable, coord);
		});
	}

	function build(callback) {
		if(vue) return callback && callback();

		terafm.ui.inject({
			html: '<div id="tmp-qa-holder"></div>',
			returnNode: '#tmp-qa-holder'
		}, function(rootnode) {
			makeVue(rootnode, () => {
				if(callback) callback();
				setupKeyNav();
			});
		});
	}

	function makeVue(rootnode, callback) {

		vue = new Vue({
			'@import-vue quickAccess':0,
			el: rootnode,
			methods: {
				showAndPopulate: function(ed, coord) {
					if(!ed) {
						throw new Error('No editable');
					}
					this.data = {sess:{}, recent: {}, empty: true};
					this.data.sess = terafm.db.getSessionsContainingEditable(terafm.focusedEditable.id).getEntriesByEditable(terafm.focusedEditable.id);
					this.data.recent = terafm.db.getEntries(10-this.data.sess.length, terafm.focusedEditable.id, function(entry) {
						return terafm.editables.isTextEditableType(entry.obj.type);
					});

					this.isEmpty = (this.data.sess.length || this.data.recent.length) ? false : true;
					this.editable = ed;
					this.position(ed, coord);
					this.unselect(); // In case previous selection is retained after populating
					this.isVisible = true;
					terafm.pauseLogging = true;
				},
				hide: function() {
					if(this.isVisible) {
						this.resetPreview();
						this.isVisible = false;
						terafm.pauseLogging = false;
					}
				},
				position: function(ed, coord) {
					let popupHeight = this.$el.clientHeight,
						popupWidth = this.$el.clientWidth;

					let pos = {x:0, y:0};
					let edrect = ed.rect();

					// Position by editable
					if(ed && !coord) {
						pos.x = edrect.x + edrect.width;
						pos.y = edrect.y;

					// Position by click coord
					} else {
						pos = coord;
					}

					// If width overflows, position by editable instead
					if(document.body.scrollWidth > 0 && pos.x + popupWidth > Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth)) {
						pos.x = edrect.x - popupWidth;
					}

					// If overflows height
					if(document.body.scrollHeight > 0 && pos.y + popupHeight > Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight) ) {
						pos.y -= popupHeight;
					}

					this.$el.style = 'top: '+ pos.y +'px; left: '+ pos.x +'px;';
				},
				preview: function(e) {
					let sel = getSelectable(e.path[0]);
					if(this.selected !== sel) {
						this.resetPreview();
						this.unselect();
						this.select(sel);

						let torestore = this.getEntryBySelected(sel);

						if(torestore) {
							
							if(sel.dataset.group === 'sess' && !sel.dataset.single) {
								this.placeholderSnapshot.set(torestore.getSession());
								torestore.getSession().setPlaceholders();

							} else if(sel.dataset.group === 'recent' || sel.dataset.group === 'sess' && sel.dataset.single) {
								this.placeholderSnapshot.set(this.editable);
								this.editable.applyPlaceholderEntry(torestore);
							}
						}
					}
				},
				resetPreview: function() {
					if(this.isVisible) {
						terafm.editables.removeHighlights();
						this.placeholderSnapshot.applyEntries();
						// console.log('clearin', this.placeholderSnapshot)
					}
				},
				restore: function(e) {
					this.resetPreview();
					this.isVisible = false;

					let sel = getSelectable(e.path[0]);
					let torestore = this.getEntryBySelected(sel);

					if(torestore) {
						if(sel.dataset.group === 'sess' && !sel.dataset.single) {
							torestore.getSession().restore();
						} else if(sel.dataset.group === 'recent' || sel.dataset.group === 'sess' && sel.dataset.single) {
							this.editable.applyEntry(torestore);
						}
					}
				},


				openRecovery: function() {
					terafm.recoveryDialogController.open();
					this.hide();
				},
				openKeyboardShortcutsModal: function() {
					terafm.keyboardShortcutController.showShortcutDialog();
					this.hide();
				},
				disableSite: function() {
					let ok = confirm(`Disable Typio completely on ${location.hostname}? The page will be refreshed.`);
					if(ok) {
						terafm.blacklist.block(window.location.hostname);
						setTimeout(() => window.location.reload(), 50); // Give it some time to block
					}
					this.hide();
				},

				getEntryBySelected: function(li) {
					if(!li.dataset.index) return false;
					if(li.dataset.group === 'sess') {
						return this.data.sess.entries[li.dataset.index];
					} else if(li.dataset.group === 'recent') {
						return this.data.recent.entries[li.dataset.index];
					}
				},

				select: function(el) {
					this.selected = el;
					this.selected.classList.add('selected');
				},
				unselect: function() {
					this.selected && this.selected.classList.remove('selected');
					this.selected = false;
				}
			},
			data: function() {
				return {
					isVisible: true,
					data: {},
					editable: false,
					selected: false,
					isEmpty: false,
					placeholderSnapshot: new terafm.EntryList()
				}
			}
		});

		if(callback) callback();
	}

	function setupKeyNav() {

		terafm.Events.on('mousedown', () => vue.hide());
		vue.$el.addEventListener('mousedown', (e) => e.stopPropagation());

		keyboardShortcuts.on(['ArrowDown'], selNext);
		keyboardShortcuts.on(['ArrowRight'], selNext);
		function selNext(e) {
			if(vue.isVisible) {
				if(e.preventDefault) {e.preventDefault(); e.stopPropagation();}

				var sels = Array.prototype.slice.call(vue.$el.querySelectorAll('.selectable:not([data-keynav-skip])')),
					currI = sels.indexOf(vue.selected),
					newsel;

				if(currI === -1 || currI === sels.length-1) {
					newsel = sels[0]
				} else {
					newsel = sels[currI+1]
				}
				newsel.dispatchEvent(new Event('mousemove'));
			}
		}

		keyboardShortcuts.on(['ArrowUp'], keyPrev);
		keyboardShortcuts.on(['ArrowLeft'], keyPrev);
		function keyPrev(e) {
			if(vue.isVisible) {
				if(e.preventDefault) {e.preventDefault(); e.stopPropagation();}

				var sels = Array.prototype.slice.call(vue.$el.querySelectorAll('.selectable:not([data-keynav-skip])')),
					currI = sels.indexOf(vue.selected),
					newsel;

				if(currI < 1) {
					newsel = sels[sels.length-1];
				} else {
					newsel = sels[currI-1];
				}
				newsel.dispatchEvent(new Event('mousemove'));
			}
		}

		keyboardShortcuts.on([' '], function(e) {
			if(vue.isVisible) {
				if(e.preventDefault) {e.preventDefault(); e.stopPropagation();}
				if(vue.selected) vue.selected.dispatchEvent(new Event('click'));
			}
		})

		keyboardShortcuts.on(['Escape'], hide);
		keyboardShortcuts.on(['Tab'], hide);
		keyboardShortcuts.on(['Shift', 'Tab'], hide);
		function hide(e) {
			if(vue.isVisible) {
				vue.hide();
			}
		}
	}


	function getSelectable(el) {
		if(el.classList.contains('selectable')) return el;
		else return el.closest('.selectable');
	}

})(terafm.quickAccessController, terafm.initHandler, terafm.options, terafm.keyboardShortcuts);