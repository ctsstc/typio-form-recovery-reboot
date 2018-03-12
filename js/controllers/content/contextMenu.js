window.terafm = window.terafm || {};
terafm.contextMenuController = {};

(function(contextMenuController, contextMenu, editableManager, db, recoveryDialogController, DOMEvents, keyboardShortcuts) {

	let contextTarget;
	let contextPos = {};

	let contextMenuNode;

	let deepSetupComplete = false;

	contextMenuController.open = (context) => {
		if(context === 'current' && terafm.focusedEditable) {
			contextTarget = terafm.focusedEditable;
			var rect = editableManager.getRect(contextTarget);
			contextPos.x = rect.x + rect.width;
			contextPos.y = rect.y;

		}

		if(contextTarget) {
			open()
		}
	};
	contextMenuController.setContext = (target, pos) => { contextTarget = target; contextPos = pos; }


	// Chrome context item clicked
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'contextMenuRecover') {
			open();
		}
	});

	DOMEvents.registerHandler('contextmenu', function(e) {
		contextTarget = editableManager.getEditable(e.path[0]);

		if(contextTarget) {
			contextPos.x = e.pageX, contextPos.y = e.pageY;
		}

	});


	function open() {

		// Nothing (or nothing editable) was right clicked
		// Can happen if page hasn't fully loaded at right click (eventhandlers haven't attached yet)
		if(!contextTarget) {
			alert("Typio cannot open due to one of the following reasons:\n\n1) Page has not fully loaded yet.\n\n2) The page is running in an inaccessible frame (cross domain).\n\n3) You're tring to recover an illegal field (e.g. password field if disabled).");
			return false;
		}

		deepSetup(function() {

			let data = getDataByEditable(contextTarget);

			contextMenu.populate(data);
			contextMenu.show();
			requestAnimationFrame(function() {
				contextMenu.position(contextPos);
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
		if(deepSetupComplete) return callback();

		contextMenu.build((node) => {
			contextMenuNode = node;
			setupDeepEventHandlers();
			callback();
		});
	}

	function setupDeepEventHandlers() {
		DOMEvents.registerHandler('mousedown', function() {
			contextMenu.hide();
			editableManager.resetPlaceholders();
		});
		
		DOMEvents.registerHandler('focus', function() {
			contextMenu.hide();
		});
		
		contextMenuNode.addEventListener('mousedown', e => e.stopPropagation());
		contextMenuNode.addEventListener('click', contextmenuClickHandler);
		contextMenuNode.addEventListener('mouseover', e => contextmenuEventHandler(e.target));
		contextMenuNode.addEventListener('mouseout', contextmenuMouseleaveHandler);


		// Todo: Refactor
		(function() {
			var selected;

			contextMenuNode.addEventListener('mouseover', function(e) {
				var target = e.path[0],
					li = target.matches('ul > li') ? target : target.closest('ul > li');

				if(li) {
					sel(li)
				}
			})

			contextMenuNode.addEventListener('mouseout', remSel)

			function sel(li) {
				selected && selected.classList.remove('selected')
				selected = li
				selected.classList.add('selected')
				contextmenuEventHandler(selected)
			}

			function remSel() {
				selected.classList.remove('selected')
				selected = null
			}

			function selNext() {
				if(selected && selected.nextElementSibling) {
					sel(selected.nextElementSibling)
				} else {
					sel(contextMenuNode.querySelector('ul > li'))
				}
			}
			function selPrev() {
				if(selected && selected.previousElementSibling) {
					sel(selected.previousElementSibling)
				} else {
					sel(contextMenuNode.querySelector('ul > li:last-child'))
				}
			}

			keyboardShortcuts.on(['ArrowDown'], function() {
				if(contextMenu.isOpen()) {
					selNext()
				}
			})
			keyboardShortcuts.on(['ArrowUp'], function() {
				if(contextMenu.isOpen()) {
					selPrev()
				}
			})
			keyboardShortcuts.on([' '], function() {
				if(contextMenu.isOpen()) {
					contextMenu.hide()

					if(selected.dataset.browseAll !== undefined) {
						recoveryDialogController.open();
					} else {
						// Minor timeout because space is added before
						setTimeout(() => contextmenuEventHandler(selected, true))
					}
				}
			})
		})();
	}
	

	function contextmenuClickHandler(e) {
		var target = e.target;

		if(target.dataset.session !== undefined) {
			contextmenuEventHandler(e.target, true);
			contextMenu.hide();
			
		} else if(target.dataset.setSingleEntry !== undefined) {
			contextmenuEventHandler(e.target, true);
			contextMenu.hide();
			
		} else if(target.dataset.browseAll !== undefined) {
			recoveryDialogController.open();
			contextMenu.hide();
		}

		e.stopPropagation();
	}

	function contextmenuMouseleaveHandler(e) {
		var target = e.relatedTarget;

		if( target && !target.closest('div > #contextmenu') ) {
			terafm.editableManager.resetPlaceholders();
		}
	}

	function contextmenuEventHandler(target, isFinal) {
		let sid = target.dataset.session,
			eid = target.dataset.editable,
			belongsToTarget = target.dataset.recOther !== undefined ? false : true;

		editableManager.resetPlaceholders();

		// Entry belongs to editable
		if(sid && belongsToTarget) {
			setPlaceholdersBy(isFinal, sid);


		// Entry belongs to editable AND set single entry was clicked
		} else if(target.dataset.setSingleEntry !== undefined) {
			
			var listItem = target.closest('[data-session]');

			if(listItem) {
				sid = listItem.dataset.session;
				eid = listItem.dataset.editable;

				setPlaceholdersBy(isFinal, sid, eid, contextTarget);
			}


		// Entry is from "recents" (does not belong to editable)
		} else if(sid && eid && !belongsToTarget) {
			setPlaceholdersBy(isFinal, sid, eid, contextTarget);
		}

	}

	function setPlaceholdersBy(isFinal, sessionId, editableId, target) {

		// By session only
		if(sessionId && !editableId) {

			let session = db.getRevisionsBySession(sessionId);

			for(editableId in session) {
				let input = editableManager.resolvePath(session[editableId].path);

				if(input) {
					editableManager.setPlaceholderValue(input, session[editableId], !isFinal);
				}
			}


		// By session and editableId (single)
		} else if(sessionId && editableId) {

			// Target is only neccesary if entry is from recents list (does not belong)
			if(!target) {
				target = contextTarget;
			}

			let rev = db.getSingleRevisionByEditableAndSession(editableId, sessionId);

			if(rev) {
				editableManager.setPlaceholderValue(target, rev, !isFinal);
			}

		}
	}

})(terafm.contextMenuController, terafm.contextMenu, terafm.editableManager, terafm.db, terafm.recoveryDialogController, terafm.DOMEvents, terafm.keyboardShortcuts);