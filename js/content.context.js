window.terafm = window.terafm || {};

(function() {

	var contextmenu,
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
				// Could show alert here but it's barely noticeable
				// in chrome so it would just be confusing to the user
				console.error('OpenContext triggered and failed. Page probably hasn\'t finished loading.', contextTarget);
				return false;
			}

			deepSetup(function() {
				var editablePath = terafm.editableManager.getPath(contextTarget),
					editableId = terafm.editableManager.generateEditableId(editablePath),
					revisions = terafm.db.getRevisionsByEditable(editableId);

				populateContextMenu(revisions, editableId);

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
		if(!contextmenu) {
			injectShadowRoot();
			injectContextHTML(function() {
				setupEventHandlers();

				// setTimeout(function() {
					callback();
				// }, 20);
			});
		} else {
			callback();
		}
	}

	function populateContextMenu(revisions, inputId) {
		var sessionId = terafm.db.sessionId();
		var html = '';

		// Don't show current session
		if (sessionId in revisions) {
			delete revisions[sessionId];
		}


		if(Object.keys(revisions).length < 1) {
			html = '<li>Nothing to recover</li>';

		} else {

			var count = 0;

			var sortedKeys = Object.keys(revisions);
			sortedKeys = sortedKeys.sort().reverse();

			for(key in sortedKeys) {
				var revision = revisions[sortedKeys[key]],
					editableId = terafm.editableManager.generateEditableId(revision.path),
					safeString = terafm.helpers.encodeHTML(revision.value).substring(0,50);

				count += 1;

				html += '<li data-session="'+ sortedKeys[key] +'" data-editable="'+ editableId +'">';
					html += '<span data-set-single-entry class="tera-icon-right tera-icon-single" title="Recover just this input"></span>';
					html += safeString;
				html += '</li>';

				// Only show 10 entries in dropdown
				if(count > 9) {
					break;
				}
			}
		}

		html += '<li data-browse-all>Browse all saved data</li>';


		contextmenu.querySelector('ul').innerHTML = html;
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

		if(contextParentFrame) {
			var frameRect = contextParentFrame.getBoundingClientRect();
			topPos += frameRect.top;
			leftPos += frameRect.left;
		}

		contextmenu.querySelector('#tera-result-list-container').style = 'top: '+ topPos +'px; left: '+ leftPos +'px;';
	}


	function showContextMenu() {
		var container = contextmenu.querySelector('#tera-result-list-container');
		container.classList.remove('hidden');
		contextmenuVisible = true;
	}

	function hideContextMenu() {
		var container = contextmenu.querySelector('#tera-result-list-container');
		container.classList.add('hidden');
		contextmenuVisible = false;
	}

	function injectShadowRoot() {
		document.body.insertAdjacentHTML('beforeend', '<div id="terafm-context"></div>');

		contextmenu = document.getElementById('terafm-context').createShadowRoot({mode: 'open'});
	}

	function injectContextHTML(callback) {

		fetchContextStylesheet(function(css) {
			var html = '';
			html += '<style> '+ css +'</style>';
			html += "<div id='tera-result-list-container' class='hidden'>";
				html += "<ul class='tera-result-list'><li>test</li></ul>"
			html += "</div>";

			contextmenu.innerHTML = html;

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

	function documentFocusHandler() {
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
			hideContextMenu();
		}

		e.stopPropagation();
	}

	function contextmenuMouseoverHandler(e) {
		var sid = e.target.dataset.session;

		terafm.editableManager.resetPlaceholders();

		if(sid !== undefined) {
			var session = terafm.db.getRevisionsBySession(sid);
			for(entry in session) {
				var input = terafm.editableManager.getEditableByPath(session[entry].path, session[entry].frame);

				if(input) {
					terafm.editableManager.setEditableValue(input, session[entry].value, true);
				}
			}
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