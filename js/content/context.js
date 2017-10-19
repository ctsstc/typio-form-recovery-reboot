window.terafm = window.terafm || {};

(function() {

	var shroot,
		contextmenu,

		contextmenuVisible = false,
		contextTarget,
		contextParentFrame;

	window.terafm.context = {
		open: function() {

			// Can't do shit without a database yo
			if(!terafm.db.initiated()) {
				alert('Typio Form Recovery is having issues with the database.');
				return false;
			}

			// Nothing (or nothing editable) was right clicked
			// Can happen if page hasn't fully loaded at right click (eventhandlers haven't attached yet)
			if(!contextTarget) {
				alert("Typio cannot open due to one of the following reasons:\n\n1) Page has not fully loaded yet.\n\n2) The page is running in an inaccessible frame (cross domain).\n\n3) You're tring to recover an illegal field (e.g. password field if disabled).");
				return false;
			}

			deepSetup(function() {
				var editablePath = terafm.editableManager.getPath(contextTarget),
					iframePath = contextParentFrame ? terafm.editableManager.getPath(contextParentFrame) : '',
					editableId = terafm.editableManager.generateEditableId(editablePath, iframePath);

				populateContextMenu(editableId);
				positionContextMenu(contextTarget);
				showContextMenu();
			});
		},

		close: function() {
			hideContextMenu();
		},

		setup: setupBasicEventHandlers,

		iframeSetContextTarget: function(target, frame) {
			contextTarget = target;
			contextParentFrame = frame;
		}

	}

	// Listens for rightclicks
	function setup() {
		setupBasicEventHandlers();
	}

	// Inserts html and context eventhandlers
	function deepSetup(callback) {
		if(!shroot) {
			shroot = terafm.getShadowRoot();
			injectContextHTML(function() {
				contextmenu = shroot.querySelector('#contextmenu');
				setupEventHandlers();
				callback();
			});
		} else {
			callback();
		}
	}

	function populateContextMenu(editableId) {

		var revs = terafm.db.getRevisionsByEditable(editableId),
			revKeys = Object.keys(revs).reverse(),

			currSessionId = terafm.db.sessionId();

		var itemsLeft = 10;

		var html = '';

		for(revKey in revKeys) {

			// Skip current session
			if(revKeys[revKey] == (currSessionId+"")) continue;

			if(itemsLeft < 1) break; itemsLeft--;

			html += generateListItemHtml(revKeys[revKey],  revs[revKeys[revKey]]);

		}

		// If less than 10 entries in field, get other recent entries to fill gap up to 10
		if(itemsLeft > 0) {
			var extraEntries = terafm.db.getRecentRevisions( editableId, itemsLeft );

			for(sessionId in extraEntries) {
				html += generateListItemHtml(sessionId,  extraEntries[sessionId], true);
				itemsLeft--;
			}
		}

		if(itemsLeft === 10) {
			html += '<li>No entries found for this input field</li>'
		}

		html += '<li class="link" data-browse-all>Browse all saved data</li>';

		shroot.querySelector('ul').innerHTML = html;
	}

	function generateListItemHtml(sessionId, revision, isOther) {
		var editableId = terafm.editableManager.generateEditableId(revision.frame, revision.path),
			safeString = encodeHTML(revision.value).substring(0,50);

		var html = '';
		html = `
		<li data-session="`+ sessionId +`" data-editable="`+ editableId +`" ` + (isOther ? 'data-rec-other' : '') + `>
			`+ (!isOther ? `<span data-set-single-entry class="tera-icon-right tera-icon-single" title="Recover just this input"></span>` : '') + `
			`+ safeString +`
		</li>
		`;
		return html;
	}

	function positionContextMenu(target) {
		var targetRect = target.getBoundingClientRect(),
			bodyRect = document.body.getBoundingClientRect(),
			UIWidth = 250, leftPos = 0, topPos = 0,
			inputBodyOffset = targetRect.left - bodyRect.left;

		// First try to align on right side of input
		if((targetRect.left + targetRect.width + UIWidth) <= document.documentElement.clientWidth) {
			leftPos = inputBodyOffset + targetRect.width;

		// Otherwise align on left side of input
		} else if((targetRect.left - UIWidth) > 0) {
			leftPos = inputBodyOffset - UIWidth;

		// Otherwise align right side of window
		} else {
			leftPos = document.documentElement.clientWidth - UIWidth;
		}

		topPos = targetRect.top + window.scrollY;
		leftPos += window.scrollX;

		if(contextParentFrame) {
			var frameRect = contextParentFrame.getBoundingClientRect();
			topPos += frameRect.top;
			leftPos += frameRect.left;
		}

		shroot.querySelector('#contextmenu').style = 'top: '+ topPos +'px; left: '+ leftPos +'px;';
	}


	function showContextMenu() {
		var container = shroot.querySelector('#contextmenu');
		container.classList.remove('hidden');
		contextmenuVisible = true;
	}

	function hideContextMenu() {
		if(contextmenuVisible) {
			var container = shroot.querySelector('#contextmenu');
			container.classList.add('hidden');
			contextmenuVisible = false;
		}
	}

	function injectContextHTML(callback) {
		var template = chrome.runtime.getURL('templates/contextmenu.tpl');

		var request = fetch(template).then(response => response.text());

		request.then(function(text) {
			shroot.querySelector('div').insertAdjacentHTML('beforeend', text);
			callback();
		});
	}


	function fetchContextStylesheet(callback) {
		var stylePath = chrome.runtime.getURL('css/content.css'),
			request = fetch(stylePath).then(response => response.text());

		request.then(function(text) {
			callback(text);
		});
	}

	function setupBasicEventHandlers() {
		//console.log('right click attached')
		document.addEventListener('contextmenu', documentContextHandler);
	}

	function setupEventHandlers() {
		window.addEventListener('resize', windowResizeHandler);

		document.addEventListener('mousedown', documentMousedownHandler);
		document.addEventListener('focus', documentFocusHandler, true);
		
		contextmenu.addEventListener('mousedown', contextmenuMousedownHandler)
		contextmenu.addEventListener('click', contextmenuClickHandler)
		contextmenu.addEventListener('mouseover', contextmenuMouseoverHandler)
		contextmenu.addEventListener('mouseout', contextmenuMouseleaveHandler)
	}


	function windowResizeHandler() {
		if(contextmenuVisible) {
			positionContextMenu(contextTarget);
		}
	}

	function documentContextHandler(e) {
		var editable = terafm.editableManager.getEditable(e.target);
		//console.log('right click', editable);
		contextTarget = editable;
		contextParentFrame = undefined;
	}

	function documentMousedownHandler(e) {
		if(contextmenuVisible) {
			hideContextMenu();
		}
	}

	function documentFocusHandler(e) {
		if(contextmenuVisible) {
			hideContextMenu();
		}
	}

	function contextmenuMousedownHandler(e) {
		e.stopPropagation();
	}
	function contextmenuClickHandler(e) {
		var target = e.target;

		if(target.dataset.session !== undefined) {
			terafm.editableManager.resetPlaceholders(true);
			hideContextMenu();
			
		} else if(target.dataset.setSingleEntry !== undefined) {
			terafm.editableManager.resetPlaceholders(true);
			hideContextMenu();
			
		} else if(target.dataset.browseAll !== undefined) {
			terafm.dialog.open();
			hideContextMenu();

		// Idk, just close it
		} else {
			//hideContextMenu();
		}

		e.stopPropagation();
	}

	function contextmenuMouseoverHandler(e) {
		var sid = e.target.dataset.session,
			isRecOther = e.target.dataset.recOther !== undefined ? true : false;

		terafm.editableManager.resetPlaceholders();

		if(sid !== undefined && isRecOther == false) {
			var session = terafm.db.getRevisionsBySession(sid);
			for(entry in session) {
				var input = terafm.editableManager.getEditableByPath(session[entry].path, session[entry].frame);

				if(input) {
					terafm.editableManager.setEditableValue(input, session[entry].value, true);
				}
			}

		} else if(sid !== undefined && isRecOther == true) {

			var rev = terafm.db.getSingleRevisionByEditableAndSession(e.target.dataset.editable, sid);
			terafm.editableManager.setEditableValue(contextTarget, rev.value, true);

		} else if(e.target.dataset.setSingleEntry !== undefined) {
			var listItem = e.target.closest('[data-session]');

			if(listItem) {
				sid = listItem.dataset.session;
				var editableId = listItem.dataset.editable,
					revision = terafm.db.getSingleRevisionByEditableAndSession(editableId, sid);

				terafm.editableManager.setEditableValue(contextTarget, revision.value, true);
			}
		}
	}

	function contextmenuMouseleaveHandler(e) {

		var target = e.relatedTarget;

		// I think this works because it's encapsulated within a shadowdom
		// and html is not accessible as an ancestor. Maybe.
		if( target.closest('html') ) {
			terafm.editableManager.resetPlaceholders();
		}
	}

})();