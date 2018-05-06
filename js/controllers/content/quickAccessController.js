window.terafm = window.terafm || {};
terafm.quickAccessController = {};

(function(controller, initHandler, options, keyboardShortcuts) {

	let vue;

	initHandler.onInit(function() {
		if(options.get('keybindEnabled')) {
			keyboardShortcuts.on(options.get('keybindOpenQuickAccess'), function(e) {
				if(e.preventDefault) {e.preventDefault(); e.stopPropagation();}

				// toggle show
				show();
			});
		}
	});

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'openQuickAccess') {
			show();
		}
	});

	function show() {
		if(vue) {
			vue.showAndPopulate();
		} else {
			build();
		}
	}

	function build(callback) {
		if(vue) return callback && callback();

		terafm.ui.inject({
			html: '<div id="tmp-qa-holder"></div>',
			returnNode: '#tmp-qa-holder'
		}, function(rootnode) {
			makeVue(rootnode, callback);
		});
	}

	function makeVue(rootnode, callback) {

		import( chrome.runtime.getURL('../templates/quickAccess.js') ).then((module) => {
			vue = new Vue({
				...(module),
				el: rootnode,
				methods: {
					showAndPopulate: function() {
						if(!terafm.focusedEditable) {
							console.warn('No terafm.focusedEditable');
							return;
						}
						this.data = {sess:{}, recent: {}, empty: true};

						this.data.sess = terafm.db.getSessionsContainingEditable(terafm.focusedEditable.id).getEntriesByEditable(terafm.focusedEditable.id);
						this.data.recent = terafm.db.getEntries(10-this.data.sess.length, terafm.focusedEditable.id);

						this.isEmpty = (this.data.sess.length || this.data.recent.length) ? false : true;
						
						console.log(this.data);
					},
					hoverPreview: function(e) {
						let li = getLI(e.path[0]);
						if(this.selected !== li) {
							this.unselect();
							this.select(li);

							let entry = this.getEntryBySelected(li);
						}
					},
					resetPreview: function() {
						console.log('reset')
					},
					restore: function(e) {
						let li = getLI(e.path[0]);
					},


					openRecovery: function() {
						
					},
					openKeyboardShortcutsModal: function() {
						
					},
					disableSite: function() {
						
					},

					getEntryBySelected: function(li) {
						if(li.dataset.group === 'sess') {
							return this.data.sess.entries[li.dataset.index];
						} else if(li.dataset.group === 'recent') {
							return this.data.recent.entries[li.dataset.index];
						}
					},

					select: function(li) {
						this.selected = li;
						li.classList.add('selected');
					},
					unselect: function() {
						this.selected && this.selected.classList.remove('selected');
						this.selected = false;
					},
					selectNext: function() {

					},
				},
				data: function() {
					return {
						data: {},
						selected: false,
						isEmpty: false
					}
				},
				mounted: function() {
					this.showAndPopulate();
				}
			});

			if(callback) callback();
		})




		function getLI(el) {
			if(el.nodeName.toLowerCase() === 'li') return el;
			else return el.closest('li');
		}
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