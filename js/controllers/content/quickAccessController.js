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
			props: ['entry', 'editable', 'isSess'],
			data: function() {
				return {
					isPreviewing: false,
					selected: false
				}
			},
			methods: {
				preview: function() {
					if(this.isPreviewing) return;

					this.isPreviewing = true;
					this.selected = true;

					if(this.isSess) {
						let sess = this.entry.getSession();

						terafm.placeholders.snapshot(sess.getEditables());
						sess.setPlaceholders();
					} else {
						terafm.placeholders.snapshot(this.editable);
						this.editable.applyPlaceholderEntry(this.entry);
					}
				},
				resetPreview: function() {
					if(!this.isPreviewing) return;

					this.isPreviewing = false;
					this.selected = false;
					terafm.placeholders.restore();
				},
				restore: function() {
					this.resetPreview();
					terafm.defaults.restore();
					this.$root.hide();

					if(this.isSess) {
						this.entry.getSession().restore();
					} else {
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
			},
			data: function() {
				return {
					isVisible: true,
					isEmpty: true,
					data: {},
					editable: false,
					isEmpty: false,
					submenuBoundary: 'left'
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
					currI = sels.indexOf(vue.$el.querySelector('.selectable.selected')),
					newsel;

				if(currI === -1 || currI === sels.length-1) {
					newsel = sels[0]
				} else {
					newsel = sels[currI+1]
				}
				console.log(sels, newsel);
				newsel.dispatchEvent(new Event('mousemove'));
			}
		}

		keyboardShortcuts.on(['ArrowUp'], keyPrev);
		keyboardShortcuts.on(['ArrowLeft'], keyPrev);
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