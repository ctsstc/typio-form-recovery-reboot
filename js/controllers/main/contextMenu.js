(function(context) {
	
	// Listen for open trigger

		// Inject contextmenu html

			// Open contextmenu for target

				// Handle mouse events for menu
					// mouseenter entry (set placeholders)
					// click entry (save placeholder, close)
					// click outside menu (to close)

	setupBasicEventHandlers();

	window.top.addEventListener('message', function(msg) {
		if(msg.data.action && msg.data.action === 'terafmSetContextTarget') {
			var path = msg.data.data,
				target = terafm.help.$(path);

			if(!target) {
				alert('SHIT!');
			}
			context.setContextTarget(target);
		}
	});

	function setupBasicEventHandlers() {
		//console.log('right click attached')
		document.addEventListener('contextmenu', documentContextHandler);
	}
	
		function documentContextHandler(e) {
			var editable = terafm.editableManager.getEditable(e.path[0]);
			// console.log('right click', editable);
			// contextTarget = editable;
			context.setContextTarget(editable);
		}



	function setupDeepEventHandlers() {
		window.addEventListener('resize', windowResizeHandler);

		document.addEventListener('mousedown', documentMousedownHandler);
		document.addEventListener('focus', documentFocusHandler, true);

		var node = context.getContextNode();
		
		node.addEventListener('mousedown', contextmenuMousedownHandler)
		node.addEventListener('click', contextmenuClickHandler)
		node.addEventListener('mouseover', contextmenuMouseoverHandler)
		node.addEventListener('mouseout', contextmenuMouseleaveHandler)
	}

		function windowResizeHandler() {
			if(contextmenuVisible) {
				positionContextMenu(contextTarget);
			}
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
				for(var entry in session) {
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


	// Used to check if script is already injected. Message is sent from background.js
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

		// Used to check if content scripts are already injected
		if(request.action === 'contextMenuRecover') {
			context.open();

			setTimeout(() => setupDeepEventHandlers(), 1);

		}
	});

})(terafm.context);