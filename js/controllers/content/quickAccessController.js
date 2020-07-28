window.terafm = window.terafm || {};
terafm.quickAccessController = {};

(function(controller, initHandler, options, keyboardShortcuts) {

	let vue;

	initHandler.onInit(function() {
		if(options.get('keybindEnabled')) {
			keyboardShortcuts.on(options.get('keybindOpenQuickAccess'), function(e) {
				if(e.preventDefault) {e.preventDefault(); e.stopPropagation();}

				// Only pass editable
				show(terafm.focusedEditable);
			});
		}
	});

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'openQuickAccess') {
			if(terafm.isBlocked) return terafm.blockController.warn();
			show(terafm.focusedEditable);
		}
	});

	controller.show = (...args) => show(...args);

	function show(editable, coord) {
		if(!terafm.focusedEditable) return terafm.toastController.create('Typio could not detect a focused input field. <a target="_blank" href="'+ chrome.runtime.getURL('html/faq.html#no-field-focus') +'">Read more.</a>');
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
			'@import-vue content/quickAccessListItem':0,
			props: ['itemType', 'action', 'isSess', 'itemText', 'itemTooltip', 'itemImg',		'entry', 'editable'],
			data: function() {
				return {
					selected: false,
					singleSelected: false
				}
			},
			methods: {
				select() {
					if(this.selected) return;
					this.$root.unselect();
					this.$root.select(this);
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
					if(this.singleSelected) return;
					this.$root.unselect();
					this.$root.select(this);
					this.singleSelected = true;

					terafm.placeholders.snapshot(this.editable);
					this.editable.applyPlaceholderEntry( this.entry );
				},
				unselect() {
					if(this.$root.currSel && this !== this.$root.currSel) {
						this.$root.currSel.unselect();
					}
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
					terafm.defaults.restore();
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
			'@import-vue content/quickAccess':0,
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
				unselect: function() {
					if(!this.currSel) return;
					this.currSel.selected = false;
					this.currSel.singleSelected = false;
					this.currSel = false;
					terafm.placeholders.restore();
				},
				select: function(obj) {
					this.currSel = obj;
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
					if(pos.x + popupWidth > docWidth() && edrect.x - popupWidth > 0) {
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
					this.unselect();
					this.isVisible = false;
				},
				abort() {
					this.hide();
					terafm.placeholders.restore();
				}
			},
			data: function() {
				return {
					isVisible: true,
					isEmpty: true,
					data: {},
					editable: false,
					isEmpty: false,
					currSel: false
				}
			}
		});
		terafm.Events.on('focus', vue.abort)

		if(callback) callback();
	}

	function setupKeyNav() {

		terafm.Events.on('mousedown', () => {
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
					vue.currSel.entry.session.deleteAll();
				} else {
					vue.currSel.entry.delete();
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

})(terafm.quickAccessController, terafm.initHandler, terafm.options, terafm.keyboardShortcuts);