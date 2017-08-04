window.terafm = window.terafm || {};

(function() {

	var contextmenu,
		contextmenuVisible = false,
		contextTarget;

	window.terafm.context = {
		setup: function() {
			injectShadowRoot();
			injectContextHTML();
			setupEventHandlers();
		},

		open: function() {
			var inputPath = terafm.inputManager.getPath(contextTarget),
				inputId = terafm.inputManager.generateEditableId(inputPath),
				revisions = terafm.db.getRevisionsByInput(inputPath);

			populateContextMenu(revisions, inputId);

			positionContextMenu(contextTarget);

			showContextMenu();
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

			var sortedKeys = Object.keys(revisions);
			sortedKeys = sortedKeys.sort().reverse();

			for(key in sortedKeys) {
				var revision = revisions[sortedKeys[key]],
					safeString = terafm.helpers.encodeHTML(revision.value).substring(0,50);

				html += '<li data-session="'+ sortedKeys[key] +'">';
					html += '<span data-delete class="tera-icon-right tera-icon-delete" title="Delete entry"></span>';
					html += '<span data-set-single-entry class="tera-icon-right tera-icon-single" title="Recover this input"></span>';
					html += safeString;
				html += '</li>';
			}
		}

		html += '<li data-browse-all>Browse all saved data</li>';


		contextmenu.querySelector('ul').innerHTML = html;
	}

	function positionContextMenu(target) {
		var targetRect = target.getBoundingClientRect(),
			bodyRect = document.body.getBoundingClientRect(),
			UIWidth = 250, leftPos = 0,
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

		contextmenu.querySelector('#tera-result-list-container').style = 'top: '+ (targetRect.top + window.scrollY) +'px; left: '+ leftPos +'px;';
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
		document.body.insertAdjacentHTML('afterbegin', '<div id="terafm-context"></div>');

		contextmenu = document.getElementById('terafm-context').createShadowRoot({mode: 'open'});
	}

	function injectContextHTML() {
		var CSSPath = chrome.runtime.getURL('css/content.css');

		var html = '';
		html += '<style> @import url("'+ CSSPath +'"); </style>';
		html += "<div id='tera-result-list-container' class='hidden'>";
			html += "<ul class='tera-result-list'><li>test</li></ul>"
		html += "</div>";
		contextmenu.innerHTML = html;
	}

	function setupEventHandlers() {
		window.addEventListener('resize', windowResizeHandler);

		document.addEventListener('contextmenu', documentContextHandler);
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
		contextTarget = e.target;
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
		console.log('stopped')
		e.stopPropagation();
	}
	function contextmenuClickHandler(e) {
		var target = e.target;

		if(target.dataset.session !== undefined) {
			terafm.inputManager.resetPlaceholders(true);
			hideContextMenu();
			
		} else if(target.dataset.browseAll !== undefined) {
			terafm.dialog.open();
			hideContextMenu();
		}

		e.stopPropagation();
	}

	function contextmenuMouseoverHandler(e) {
		var sid = e.target.dataset.session;

		terafm.inputManager.resetPlaceholders();

		if(sid !== undefined) {
			var session = terafm.db.getRevisionsBySession(sid);
			for(entry in session) {
				var input = document.querySelector(session[entry].path);

				if(input) {
					terafm.inputManager.setInputValue(input, session[entry].value, true);
				} else {
					console.log('NOT FOUND!', session[entry].path)
				}
			}
		}
	}

	function contextmenuMouseleaveHandler(e) {

		var target = e.relatedTarget;

		// I think this works because it's encapsulated within a shadowdom
		// and html is not accessible as an ancestor. Maybe.
		if( target.closest('html') ) {
			terafm.inputManager.resetPlaceholders();
			console.log('left tera-result-list-container')
		}
	}

})();