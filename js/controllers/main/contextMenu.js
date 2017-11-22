(function(contextMenu, editableManager, db, recoveryDialogController) {

	let contextTarget;
	let contextPos = {};

	let contextMenuNode;

	let deepSetupComplete = false;


	// Chrome context item clicked
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'contextMenuRecover') {
			// console.log('trig')
			open();
		}
	});

	terafm.registerHandler('contextmenu', function(e) {
		contextTarget = editableManager.getEditable(e.path[0]);

		if(contextTarget) {
			contextPos.x = e.pageX, contextPos.y = e.pageY;
			let el = e.path[0], pos;

			// If in frame, break out and grab coordinates for each frame
			while(el.ownerDocument !== window.top.document) {
				el = el.ownerDocument.defaultView.frameElement;

				pos = el.getBoundingClientRect();
				contextPos.x += pos.x;
				contextPos.y += pos.y;
			}

			if(pos) {
				contextPos.x += window.scrollX;
				contextPos.y += window.scrollY;
			}

		}

	});


	function open() {

		// Nothing (or nothing editable) was right clicked
		// Can happen if page hasn't fully loaded at right click (eventhandlers haven't attached yet)
		if(!contextTarget) {
			alert("Typio cannot open due to one of the following reasons:\n\n1) Page has not fully loaded yet.\n\n2) The page is running in an inaccessible frame (cross domain).\n\n3) You're tring to recover an illegal field (e.g. password field if disabled).");
			return false;
		}

		if(!terafm.db.initiated()) {
			alert('Typio Form Recovery is having issues with the database.');
			return false;
		}

		deepSetup(function() {
			let data = getDataByEditable(contextTarget);

			contextMenu.populate(data);
			contextMenu.position(contextPos);
			contextMenu.show();
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

		let data = {match:[], other: []};

		for(let revKey in revKeys) {

			// Skip current session
			if(revKeys[revKey] == (currSessionId+"")) continue;
			if(itemsLeft < 1) break; itemsLeft--;

			data.match[revKeys[revKey]] = revs[revKeys[revKey]];
		}

		// If less than 10 entries in field, get other recent entries to fill gap up to 10
		if(itemsLeft > 0) {
			let extraEntries = db.getRecentRevisions( editableId, itemsLeft );

			for(let sessionId in extraEntries) {
				data.other[sessionId] = extraEntries[sessionId];
				itemsLeft--;
			}
		}

		data.length = 10 - itemsLeft;

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
		terafm.registerHandler('mousedown', function() {
			// console.log('mousedown close context');
			contextMenu.hide();
		}); // Add true
		
		terafm.registerHandler('focus', function() {
			// console.log('focus close context');
			contextMenu.hide();
		}); // Add true
		
		contextMenuNode.addEventListener('mousedown', e => e.stopPropagation());
		contextMenuNode.addEventListener('click', contextmenuClickHandler);
		contextMenuNode.addEventListener('mouseover', contextmenuMouseoverHandler);
		contextMenuNode.addEventListener('mouseout', contextmenuMouseleaveHandler);
	}

	window.top.addEventListener('message', function(msg) {
		if(msg.data.action && msg.data.action === 'terafmSetContextTarget') {
			var path = msg.data.data.path,
				target = terafm.help.$(path);

			if(!target) {
				alert('SHIT!'); // Todo: Remove
			}
			contextTarget = target;
			contextPos = msg.data.data.pos;
		}
	});

	function contextmenuClickHandler(e) {
		var target = e.target;

		if(target.dataset.session !== undefined) {
			editableManager.resetPlaceholders(true);
			contextMenu.hide();
			
		} else if(target.dataset.setSingleEntry !== undefined) {
			editableManager.resetPlaceholders(true);
			contextMenu.hide();
			
		} else if(target.dataset.browseAll !== undefined) {
			console.log(terafm, recoveryDialogController);
			recoveryDialogController.open();
			contextMenu.hide();
		}

		e.stopPropagation();
	}

	// I think this works because it's encapsulated within a shadowdom
	// and html is not accessible as an ancestor. Maybe.
	//(e) => e.relatedTarget && e.relatedTarget.closest('html') && terafm.editableManager.resetPlaceholders();
	function contextmenuMouseleaveHandler(e) {

		var target = e.relatedTarget;

		if( target && target.closest('html') ) {
			terafm.editableManager.resetPlaceholders();
		}
	}

	// Todo: Clean up this mess
	function contextmenuMouseoverHandler(e) {
		let target = e.target,
			sid = target.dataset.session,
			isRecOther = target.dataset.recOther !== undefined ? true : false;

		terafm.editableManager.resetPlaceholders();

		// Entry belongs to editable
		if(sid !== undefined && isRecOther == false) {
			var session = terafm.db.getRevisionsBySession(sid);
			for(var entry in session) {
				var input = terafm.editableManager.getEditableByPath(session[entry].path);

				if(input) {
					terafm.editableManager.setEditableValue(input, session[entry].value, true);
				}
			}

		// Is "other" entry (does not belong to editable)
		} else if(sid !== undefined && isRecOther == true) {

			var rev = terafm.db.getSingleRevisionByEditableAndSession(target.dataset.editable, target.dataset.session);
			terafm.editableManager.setEditableValue(contextTarget, rev.value, true);

		// Set single entry
		} else if(target.dataset.setSingleEntry !== undefined) {
			var listItem = target.closest('[data-session]');

			if(listItem) {
				sid = listItem.dataset.session;
				var editableId = listItem.dataset.editable,
					revision = terafm.db.getSingleRevisionByEditableAndSession(editableId, sid);

				terafm.editableManager.setEditableValue(contextTarget, revision.value, true);
			}
		}
	}

})(terafm.contextMenu, terafm.editableManager, terafm.db, terafm.recoveryDialogController);