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
								torestore.getSession().setPlaceholders();
							} else if(sel.dataset.group === 'recent' || sel.dataset.group === 'sess' && sel.dataset.single) {
								this.editable.applyPlaceholderEntry(torestore);
							}
						}
					}
				},
				resetPreview: function() {
					if(this.isVisible) terafm.editables.resetPlaceholders();
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


/*
(function(quickAccessController, quickAccess, editableManager, db, recoveryDialogController, Events, keyboardShortcuts, options, initHandler) {
	"use strict";

	let contextTarget;
	let contextTargetRect = {};

	let quickAccessNode;

	let lastListActionTarget;

	let populatedData;

	// Key combo to open
	initHandler.onInit(function() {
		if(options.get('keybindEnabled')) {
			keyboardShortcuts.on(options.get('keybindOpenQuickAccess'), function(e) {
				if(e.preventDefault) {e.preventDefault(); e.stopPropagation();}

				if(!quickAccess.isOpen() && terafm.focusedEditable) {
					contextTarget = terafm.focusedEditable;
					contextTargetRect = contextTarget.rect();
					open();
				} else {
					quickAccess.hide()
					terafm.editables.resetPlaceholders();
				}
			});
		}
	});

	quickAccessController.open = function() {
		if(contextTarget) {
			open() 
		}
	};
	quickAccessController.hide = function() {
		quickAccess.hide();
	}
	quickAccessController.setContext = (editable, pos) => { contextTarget = editable; contextTargetRect = pos; }

	// Chrome context item clicked
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'openQuickAccess') {
			open();
		}
	});

	Events.on('contextmenu', function(e) {
		contextTarget = terafm.editables.get(e.path[0]);

		if(contextTarget) {
			contextTargetRect = {}
			contextTargetRect.x = e.pageX;
			contextTargetRect.y = e.pageY;
		}
	});


	function open(context) {

		if(!terafm.focusedEditable) return false;

		// Nothing (or nothing editable) was right clicked
		// Can happen if page hasn't fully loaded at right click (eventhandlers haven't attached yet)
		if(!contextTarget) {
			alert("Typio cannot open due to one of the following reasons:\n\n1) Page has not fully loaded yet.\n\n2) The page is running in an inaccessible frame (cross domain).\n\n3) You're tring to recover an illegal field (e.g. password field if disabled).");
			return false;
		}
		deepSetup(function() {
			db.fetch().then(() => {
				populatedData = getDataByEditable(contextTarget);

				quickAccess.populate(populatedData);
				quickAccess.show();
				requestAnimationFrame(function() {
					quickAccess.position(contextTargetRect);
				})
			});
		});
	}

	// Returns entries to populate context menu with
	// Returns an object with two arrays in "sess" and "recent"
	function getDataByEditable(editable) {
		let data = {sess:{}, recent: {}, empty: true};

		data.sess = terafm.db.getSessionsContainingEditable(editable.id).getEntriesByEditable(editable.id);
		data.recent = terafm.db.getEntries(10-data.sess.length, editable.id);

		if(data.sess.length || data.recent.length) data.empty = false;

		return data;
	}

	// Injects HTML and attaches eventlisteners
	function deepSetup(callback) {
		if(quickAccessNode) return callback();

		quickAccess.build((node) => {
			quickAccessNode = node;
			setupDeepEventHandlers();
			callback();
		});
	}

	function setupDeepEventHandlers() {
		
		let selected;

		// Captures mousedown anywhere outside quickaccess popup.
		// Mousedown events on quickaccess are stopped below.
		Events.on('mousedown', function() {
			quickAccess.hide();
			terafm.editables.resetPlaceholders();
		});
		quickAccessNode.addEventListener('mousedown', e => e.stopPropagation());
		
		quickAccessNode.addEventListener('click', e => {
			e.stopPropagation();
			handleListAction(e.target, true);
		});
		
		quickAccessNode.addEventListener('mousemove', function(e) {
			var target = e.path[0],
				li = target.nodeName.toLowerCase() === 'li' ? target : target.closest('li');

			if(li) {
				sel(li, target);
			} else {
				handleListAction(target)
			}
		})

		quickAccessNode.addEventListener('mouseout', function(e) {
			remSel()

			var target = e.relatedTarget;
			if(quickAccess.isOpen() && target && !target.closest('#quickAccess') ) {
				terafm.editables.resetPlaceholders();
			}
		});

		keyboardShortcuts.on(['Tab'], e => {
			if(quickAccess.isOpen()) {
				quickAccess.hide();
			}
		});

		function sel(li, target) {
			selected && selected.classList.remove('selected')
			selected = li
			selected.classList.add('selected')
			handleListAction(target || li)
		}

		function remSel() {
			if(selected) {
				selected.classList.remove('selected')
				selected = null
				lastListActionTarget = null;
			}
		}

		function selNext() {
			var lis = Array.prototype.slice.call(quickAccessNode.querySelectorAll('li')),
				currI = lis.indexOf(selected);

			if(currI === -1 || currI === lis.length-1) {
				sel(lis[0])
			} else {
				sel(lis[currI+1])
			}
		}
		function selPrev() {
			var lis = Array.prototype.slice.call(quickAccessNode.querySelectorAll('li')),
				currI = lis.indexOf(selected);

			if(currI < 1) {
				sel(lis[lis.length-1])
			} else {
				sel(lis[currI-1])
			}
		}

		function keyNext(e) {
			if(quickAccess.isOpen()) {
				if(e.preventDefault) {e.preventDefault(); e.stopPropagation();}
				selNext()
			}
		}
		keyboardShortcuts.on(['ArrowDown'], keyNext);
		keyboardShortcuts.on(['ArrowRight'], keyNext);

		function keyPrev(e) {
			if(quickAccess.isOpen()) {
				if(e.preventDefault) {e.preventDefault(); e.stopPropagation();}
				selPrev()
			}
		}
		keyboardShortcuts.on(['ArrowUp'], keyPrev);
		keyboardShortcuts.on(['ArrowLeft'], keyPrev);

		keyboardShortcuts.on([' '], function(e) {
			if(quickAccess.isOpen()) {
				if(e.preventDefault) {e.preventDefault(); e.stopPropagation();}
				handleListAction(selected, true);
			}
		})

		keyboardShortcuts.on(['Escape'], function(e) {
			if(quickAccess.isOpen()) {
				if(e.preventDefault) {e.preventDefault(); e.stopPropagation();}
				quickAccess.hide();
				terafm.editables.resetPlaceholders();
			}
		});
	}
	

	function handleListAction(target, commit) {

		target = target.matches(['data-action']) ? target : target.closest('[data-action]');

		if(!target) return !commit || quickAccess.hide();
		if(!commit && target === lastListActionTarget) return;

		lastListActionTarget = target;

		var data = target.dataset;

		terafm.editables.resetPlaceholders();

		let torestore;

		if(data.action === 'restore-sess') {
			if(data.group === 'sess') {
				let entry = populatedData['sess']['entries'][data.eid];
				torestore = entry.getSession();

			} else if(data.group === 'single') {
				torestore = populatedData['sess']['entries'][data.eid];
			}

		} else if(data.action === 'restore-single' && data.group === 'single') {
			torestore = populatedData['recent']['entries'][data.eid];
		}

		// Preview
		if(!commit) {
			if(torestore instanceof terafm.Session) {
				torestore.setPlaceholders();
			} else if(torestore instanceof terafm.Entry) {
				contextTarget.applyPlaceholderEntry(torestore);
			}

		// Commit (click, select)
		} else {
			if(torestore instanceof terafm.Session) {
				torestore.restore();
			} else if(torestore instanceof terafm.Entry) {
				contextTarget.applyEntry(torestore);
			}

			quickAccess.hide();

			if(data.action === 'browse-all') {
				terafm.recoveryDialogController.open();

			} else if(data.action === 'keyboard-shortcuts') {
				terafm.keyboardShortcutController.showShortcutDialog();

			} else if(data.action === 'disable-site') {
				terafm.blacklist.block(window.location.hostname);
				var reload = confirm(`Typio will be disabled on ${location.hostname} on the next page load. \n\nReload the page now?`)
				if(reload) {
					location.reload();
				}
			}
		}
	}

})(terafm.quickAccessController, terafm.quickAccess, terafm.editableManager, terafm.db, terafm.recoveryDialogController, terafm.Events, terafm.keyboardShortcuts, terafm.options, terafm.initHandler);

*/