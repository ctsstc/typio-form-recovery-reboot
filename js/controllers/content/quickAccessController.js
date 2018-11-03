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
		if(!terafm.focusedEditable) return;
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
			props: ['itemType', 'action', 'isSess', 'itemText', 'itemTooltip', 'itemImg',		'entry', 'editable'],
			data: function() {
				return {
					selected: false,
					singleSelected: false
				}
			},
			methods: {
				select() {
					// this.$root.currSel = this;
					if(this.selected) return;
					this.unselect();
					this.selected = true;

					if(this.itemType === 'entry' && this.isSess) {
						let sess = this.entry.getSession();

						terafm.placeholders.snapshot(sess.getEditables());
						sess.setPlaceholders();
					} else if(this.itemType === 'entry') {
						terafm.placeholders.snapshot(this.editable);
						this.editable.applyPlaceholderEntry(this.entry);
					}
				},
				singleSelect() {
					// this.$root.currSel = this;
					if(this.singleSelected) return;
					this.unselect();
					this.singleSelected = true;

					terafm.placeholders.snapshot(this.editable);
					this.editable.applyPlaceholderEntry( this.entry );
				},
				unselect() {
					// this.$root.currSel = undefined;
					if(!this.selected && !this.singleSelected) return;

					this.selected = false;
					this.singleSelected = false;

					terafm.placeholders.restore();
				},
				commit(commitSingleFromSession) {
					if(this.itemType === 'link') {
						if(this.action === 'openRecovery') terafm.recoveryDialogController.open();
						else if(this.action === 'openKeyboardModal') terafm.keyboardShortcutController.showShortcutDialog();
						else if(this.action === 'disableTypio') terafm.blockController.block();
						else return;
					}

					terafm.placeholders.restore();
					this.$root.hide();

					if(this.entry) {
						if(!this.isSess || commitSingleFromSession) {
							this.editable.applyEntry(this.entry);
						
						} else if(this.isSess) {
							this.entry.getSession().restore();
						}
					}
				},
			}
		});

		vue = new Vue({
			'@import-vue quickAccess':0,
			el: rootnode,
			methods: {
				showAndPopulate: function(ed, coord) {
					if(!ed) throw new Error('No editable');

					let maxItems = 10;
					let data = { sess: [], recent: [] };

					if(terafm.options.get('qaGroupSessions')) {
						data.sess = terafm.db.getSessionsContainingEditable(terafm.focusedEditable.id, maxItems).getEntriesByEditable(terafm.focusedEditable.id, maxItems);
					}
					data.recent = terafm.db.getEntries(maxItems-data.sess.length, terafm.focusedEditable.id, function(entry) {
						return terafm.editables.isTextEditableType(entry.type);
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
				}
			},
			data: function() {
				return {
					isVisible: true,
					isEmpty: true,
					data: {},
					editable: false,
					isEmpty: false
				}
			}
		});
		terafm.Events.on('focus', (e) => {
			vue.isVisible = false;
		})

		if(callback) callback();
	}

	function setupKeyNav() {

		terafm.Events.on('mousedown', () => vue.hide());
		vue.$el.addEventListener('mousedown', (e) => e.stopPropagation());
		
		
		keyboardShortcuts.on(['ArrowDown'], function(e) {sel('next', e)});
		keyboardShortcuts.on(['ArrowRight'], function(e) {sel('next', e)});
		keyboardShortcuts.on(['ArrowUp'], function(e) {sel('prev', e)});
		keyboardShortcuts.on(['ArrowLeft'], function(e) {sel('prev', e)});
		
		function sel(direction, e) {
			if(vue.isVisible) {
				if(e.preventDefault) {e.preventDefault(); e.stopPropagation();}

				var sels = Array.prototype.slice.call(vue.$el.querySelectorAll('.selectable')),
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

		keyboardShortcuts.on(['Escape'], hide);
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