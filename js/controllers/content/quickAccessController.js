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

					let maxItems = 10;
					let data = {};
					data.sess = terafm.db.getSessionsContainingEditable(terafm.focusedEditable.id).getEntriesByEditable(terafm.focusedEditable.id, maxItems);
					data.recent = terafm.db.getEntries(maxItems-data.sess.length, terafm.focusedEditable.id, function(entry) {
						return terafm.editables.isTextEditableType(entry.obj.type);
					});

					this.data = data;
					this.isEmpty = (data.sess.length || data.recent.length) ? false : true;

					this.editable = ed;
					this.unselect(); // In case previous selection is retained after populating
					this.isVisible = true;

					requestAnimationFrame(() => {
						this.position(ed, coord);
					});
				},
				hide: function() {
					if(this.isVisible) {
						this.resetPreview();
						this.isVisible = false;
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
					if(pos.x + popupWidth > docWidth()) {
						pos.x = edrect.x - popupWidth;
					}

					// If overflows height
					if(pos.y + popupHeight > docHeight()) {
						pos.y -= popupHeight;
					}

					this.$el.style = 'top: '+ pos.y +'px; left: '+ pos.x +'px;';

					function docHeight() {
						return document.documentElement.scrollHeight; //return Math.max(document.documentElement.scrollHeight, document.body.scrollHeight/*, document.documentElement.clientHeight*/);
					}
					function docWidth() {
						return document.documentElement.scrollWidth;
					}
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
								let sess = torestore.getSession();

								terafm.placeholders.snapshot(sess.getEditables());
								sess.setPlaceholders();
								this.isPreviewing = true;

							} else if(sel.dataset.group === 'recent' || sel.dataset.group === 'sess' && sel.dataset.single) {
								terafm.placeholders.snapshot(this.editable);
								this.editable.applyPlaceholderEntry(torestore);
								this.isPreviewing = true;
							}
						}
					}
				},
				resetPreview: function() {
					if(this.isVisible && this.isPreviewing) {
						terafm.placeholders.restore();
						this.isPreviewing = false;
					}
				},
				restore: function(e) {
					this.resetPreview();
					terafm.defaults.restore();
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
					terafm.blockController.block();
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
					isEmpty: true,
					data: {},
					editable: false,
					selected: false,
					isEmpty: false
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