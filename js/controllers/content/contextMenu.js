window.terafm = window.terafm || {};
terafm.contextMenuController = {};

(function(contextMenuController, contextMenu, editableManager, db, recoveryDialogController, DOMEvents, keyboardShortcuts, options, initHandler) {

	let contextTarget;
	let contextTargetRect = {};

	let contextMenuNode;

	// Key combo to open
	initHandler.onInit(function() {
		if(options.get('keybindEnabled')) {
			keyboardShortcuts.on(options.get('keybindOpenQuickAccess'), function() {
				open('current')
			});
		} 
	});

	contextMenuController.open = function() {
		if(contextTarget) {
			open() 
		}
	};
	contextMenuController.hide = function() {
		contextMenu.hide();
	}
	contextMenuController.setContext = (target, pos) => { contextTarget = target; contextTargetRect = pos; }


	// Chrome context item clicked
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'contextMenuRecover') {
			open();
		}
	});

	DOMEvents.registerHandler('contextmenu', function(e) {
		contextTarget = editableManager.getEditable(e.path[0]);

		if(contextTarget) {
			contextTargetRect = {}
			contextTargetRect.x = e.pageX;
			contextTargetRect.y = e.pageY;
		}

	});


	function open(context) {

		// Open for currently focused?
		if(context === 'current' && terafm.focusedEditable) {
			contextTarget = terafm.focusedEditable;
			contextTargetRect = editableManager.getRect(contextTarget);
		}

		// Nothing (or nothing editable) was right clicked
		// Can happen if page hasn't fully loaded at right click (eventhandlers haven't attached yet)
		if(!contextTarget) {
			// alert("Typio cannot open due to one of the following reasons:\n\n1) Page has not fully loaded yet.\n\n2) The page is running in an inaccessible frame (cross domain).\n\n3) You're tring to recover an illegal field (e.g. password field if disabled).");
			return false;
		}

		deepSetup(function() {

			let data = getDataByEditable(contextTarget);

			contextMenu.populate(data);
			contextMenu.show();
			requestAnimationFrame(function() {
				contextMenu.position(contextTargetRect);
			})
		});
	}

	// Returns entries to populate context menu with
	// Returns an object with two arrays in "match" and "other"
	function getDataByEditable(editable) {
		let editableId = editableManager.generateEditableId(editable),
			revs = db.getRevisionsByEditable(editableId),
			revKeys = Object.keys(revs).reverse(),

			currSessionId = db.sessionId();

		let itemsLeft = 10;

		let data = {match:{}, other: {}, empty: true};

		for(let revKey in revKeys) {

			// Skip current session
			//if(revKeys[revKey] == (currSessionId+"")) continue;
			if(itemsLeft < 1) break; itemsLeft--;

			let sessId = revKeys[revKey],
				entry = revs[sessId];

			data.match[sessId] = entry;
			data.empty = false;
		}

		// If less than 10 entries in field, get other recent entries to fill gap up to 10
		if(itemsLeft > 0) {
			let extraEntries = db.getRecentRevisions( editableId, itemsLeft );
			if(Object.keys(extraEntries).length) {
				data.other = extraEntries;
				data.empty = false;
			}
		}

		return data;
	}

	// Injects HTML and attaches eventlisteners
	function deepSetup(callback) {
		if(contextMenuNode) return callback();

		contextMenu.build((node) => {
			contextMenuNode = node;
			setupDeepEventHandlers();
			callback();
		});
	}

	function setupDeepEventHandlers() {
		
		let selected;

		// Captures mousedown anywhere outside quickaccess popup.
		// Mousedown events on quickaccess are stopped below.
		DOMEvents.registerHandler('mousedown', function() {
			contextMenu.hide();
			editableManager.resetPlaceholders();
		});
		contextMenuNode.addEventListener('mousedown', e => e.stopPropagation());
		
		DOMEvents.registerHandler('focus', function() {
			editableManager.resetPlaceholders();
			contextMenu.hide();
		});
		
		contextMenuNode.addEventListener('click', e => {
			e.stopPropagation();
			handleListAction(e.target, true);
		});
		
		contextMenuNode.addEventListener('mouseover', function(e) {
			var target = e.path[0],
				li = target.matches('li') ? target : target.closest('li');

			if(li) {
				sel(li, target)
			}
		})

		contextMenuNode.addEventListener('mouseout', function(e) {
			remSel()

			var target = e.relatedTarget;
			if(contextMenu.isOpen() && target && !target.closest('#contextmenu') ) {
				editableManager.resetPlaceholders();
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
			}
		}

		function selNext() {
			var lis = Array.prototype.slice.call(contextMenuNode.querySelectorAll('li')),
				currI = lis.indexOf(selected);

			if(currI === -1 || currI === lis.length-1) {
				sel(lis[0])
			} else {
				sel(lis[currI+1])
			}
		}
		function selPrev() {
			var lis = Array.prototype.slice.call(contextMenuNode.querySelectorAll('li')),
				currI = lis.indexOf(selected);

			if(currI < 1) {
				sel(lis[lis.length-1])
			} else {
				sel(lis[currI-1])
			}
		}

		function keyNext(e) {
			if(contextMenu.isOpen()) {
				e.preventDefault && e.preventDefault();
				selNext()
			}
		}
		keyboardShortcuts.on(['ArrowDown'], keyNext);
		keyboardShortcuts.on(['ArrowRight'], keyNext);

		function keyPrev(e) {
			if(contextMenu.isOpen()) {
				e.preventDefault && e.preventDefault();
				selPrev()
			}
		}
		keyboardShortcuts.on(['ArrowUp'], keyPrev);
		keyboardShortcuts.on(['ArrowLeft'], keyPrev);

		keyboardShortcuts.on([' '], function(e) {
			if(contextMenu.isOpen()) {
				e.preventDefault && e.preventDefault();
				handleListAction(selected, true);
			}
		})

		keyboardShortcuts.on(['Escape'], function() {
			contextMenu.hide();
			editableManager.resetPlaceholders();
		});
	}
	

	function handleListAction(target, commit) {

		target = target.matches(['data-action']) ? target : target.closest('[data-action]');
		var data = target.dataset;

		editableManager.resetPlaceholders();

		if(data.action === 'rec-session') {
			editableManager.restoreBy(commit, data.session)
	
		} else if(data.action === 'rec-single') {
			editableManager.restoreBy(commit, data.session, data.editable, contextTarget)
	
		} else if(data.action === 'rec-single-related') {
			editableManager.restoreBy(commit, data.session, data.editable, contextTarget)
		}

		// On click/select
		if(commit) {

			contextMenu.hide();

			if(data.action === 'browse-all') {
				recoveryDialogController.open();

			} else if(data.action === 'keyboard-shortcuts') {
				console.log('opening keyboard shortcuts')

			} else if(data.action === 'disable-site') {
				terafm.blacklist.block(window.location.hostname);
				var reload = confirm(`Typio will be disabled on ${location.hostname} on the next page load. \n\nReload the page now?`)
				if(reload) {
					location.reload();
				}
			}
		}
	}

})(terafm.contextMenuController, terafm.contextMenu, terafm.editableManager, terafm.db, terafm.recoveryDialogController, terafm.DOMEvents, terafm.keyboardShortcuts, terafm.options, terafm.initHandler);