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

		Vue.component('entry-item', {
			'@import-vue quickAccessListItem':0,
			props: ['itemType', 'action', 'hasSub', 'isSub', 'subId', 'itemText',		'entry', 'editable'],
			data: function() {
				return {
					isPreviewing: false,
					selected: false
				}
			},
			methods: {
				select() {
					if(this.isPreviewing) return;

					clearTimeout(this.$root.subTmt);

					// Show sub
					if(this.hasSub && this.subId === 'sess') {
						this.$root.setsub({
							showId: this.subId,
							posY: this.$el.offsetTop,
							listItem: this.$el,
							entries: this.entry.getSession().entries,
							editable: this.editable,
						});
					} else if(this.hasSub && this.subId === 'footer') {
						this.$root.setsub({
							showId: this.subId,
							posY: this.$el.offsetTop,
							listItem: this.$el,
						});
					} else if(!this.isSub) {
						this.$root.setsub({showId: null});
					}

					this.isPreviewing = true;
					this.selected = true;

					if(this.itemType === 'entry' && this.hasSub) {
						let sess = this.entry.getSession();

						terafm.placeholders.snapshot(sess.getEditables());
						sess.setPlaceholders();
					} else if(this.itemType === 'entry') {
						terafm.placeholders.snapshot(this.editable);
						this.editable.applyPlaceholderEntry(this.entry);
					}
				},
				unselect() {
					if(!this.isPreviewing) return;

					this.isPreviewing = false;
					this.selected = false;
					terafm.placeholders.restore();
				},
				commit() {
					if(this.itemType === 'link') {
						if(this.action === 'openRecovery') terafm.recoveryDialogController.open();
						else if(this.action === 'openKeyboardModal') terafm.keyboardShortcutController.showShortcutDialog();
						else if(this.action === 'disableTypio') terafm.blockController.block();
						else return;
					}

					this.unselect();
					this.$root.hide();

					if(this.hasSub && this.subId === 'sess') {
						this.entry.getSession().restore();

					} else if(this.entry) {
						this.editable.applyEntry(this.entry);

					}
				}
			}
		});

		vue = new Vue({
			'@import-vue quickAccess':0,
			el: rootnode,
			methods: {
				showAndPopulate: function(ed, coord) {
					if(!ed) throw new Error('No editable');

					let maxItems = 10;
					let data = {};
					data.sess = terafm.db.getSessionsContainingEditable(terafm.focusedEditable.id).getEntriesByEditable(terafm.focusedEditable.id, maxItems);
					data.recent = terafm.db.getEntries(maxItems-data.sess.length, terafm.focusedEditable.id, function(entry) {
						return terafm.editables.isTextEditableType(entry.obj.type);
					});

					this.data = data;
					this.isEmpty = (data.sess.length || data.recent.length) ? false : true;

					this.editable = ed;
					this.isVisible = true;
					this.submenu.show = false;

					requestAnimationFrame(() => {
						this.position(ed, coord);
					});
				},
				position: function(ed, coord) {
					let popupHeight = this.$el.clientHeight,
						popupWidth = this.$el.clientWidth;

					let pos = {x:0, y:0};
					let edrect = ed.rect();

					// Position by editable
					if(ed && !coord) {
						pos.x = edrect.x + edrect.width;
						pos.y = edrect.y + 6;

					// Position by click coord
					} else {
						pos = coord;
					}

					if(pos.x + (popupWidth*2) > docWidth()) {
						this.submenuBoundary = 'right';
					} else {
						this.submenuBoundary = 'left';
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
				hide: function() {
					this.isVisible = false;
					this.submenu.showId = null;
				},

				setsub(data) {
					clearTimeout(this.subTmt);
					this.subTmt = setTimeout(function() {
						if(data.hasOwnProperty('listItem')) {
							let stillSelected = data.listItem.classList.contains('selected');
							if(stillSelected) {
								this.submenu = {...this.submenu, ...data};
							}
						} else {
							this.submenu = {...this.submenu, ...data};
						}
					}.bind(this), 300);
				}
			},
			data: function() {
				return {
					isVisible: true,
					isEmpty: true,
					data: {},
					editable: false,
					isEmpty: false,
					submenuBoundary: 'left',
					submenu: {}
				}
			}
		});

		if(callback) callback();
	}

	function setupKeyNav() {

		terafm.Events.on('mousedown', () => vue.hide());
		vue.$el.addEventListener('mousedown', (e) => e.stopPropagation());

		keyboardShortcuts.on(['ArrowDown'], selNext);
		// keyboardShortcuts.on(['ArrowRight'], selNext);
		function selNext(e) {
			if(vue.isVisible) {
				if(e.preventDefault) {e.preventDefault(); e.stopPropagation();}

				var sels = Array.prototype.slice.call(vue.$el.querySelectorAll('.selectable')),
					currSel = vue.$el.querySelector('.selectable.selected'),
					currI = sels.indexOf(currSel),
					newSel;

				if(currI === -1 || currI === sels.length-1) {
					newSel = sels[0]
				} else {
					newSel = sels[currI+1]
				}

				console.log(currSel, newSel);
				if(currSel) currSel.dispatchEvent(new Event('mouseleave'));
				newSel.dispatchEvent(new Event('mouseenter'));
			}
		}

		keyboardShortcuts.on(['ArrowUp'], keyPrev);
		// keyboardShortcuts.on(['ArrowLeft'], keyPrev);
		function keyPrev(e) {
			if(vue.isVisible) {
				if(e.preventDefault) {e.preventDefault(); e.stopPropagation();}

				var sels = Array.prototype.slice.call(vue.$el.querySelectorAll('.selectable:not([data-keynav-skip])')),
					currI = sels.indexOf(vue.$el.querySelector('.selectable.selected')),
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