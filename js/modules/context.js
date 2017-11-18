window.terafm = window.terafm || {};
terafm.context = {};

(function(context, ui, help) {
	'use strict';

	var shroot,
		contextmenu,

		contextmenuVisible = false,
		contextTarget;

	context.open = function() {

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
			var editablePath = terafm.editableManager.genPath(contextTarget),
				editableId = terafm.editableManager.generateEditableId(editablePath);

			populateContextMenu(editableId);
			positionContextMenu(contextTarget);
			showContextMenu();
		});
	},

	context.close = function() {
		hideContextMenu();
	},

	// context.setup = () => deepSetup();

	context.setContextTarget = (target) => {
		contextTarget = target;
		console.log('setting target', target)
	};

	context.getContextNode = () => contextmenu;



	// Inserts html and context eventhandlers
	function deepSetup(callback) {
		if(!shroot) {
			shroot = ui.getShadowRoot();
			injectContextHTML(function() {
				contextmenu = shroot.querySelector('#contextmenu');
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

		for(var revKey in revKeys) {

			// Skip current session
			if(revKeys[revKey] == (currSessionId+"")) continue;

			if(itemsLeft < 1) break; itemsLeft--;

			html += generateListItemHtml(revKeys[revKey],  revs[revKeys[revKey]]);

		}

		// If less than 10 entries in field, get other recent entries to fill gap up to 10
		if(itemsLeft > 0) {
			var extraEntries = terafm.db.getRecentRevisions( editableId, itemsLeft );

			for(var sessionId in extraEntries) {
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
		
		console.log('adsy')
		var editableId = terafm.editableManager.generateEditableId(revision.path),
			safeString = help.encodeHTML(revision.value).substring(0,50);

		console.log('yaoooo')
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

		// Todo: Make sure it positions correctly
		// if(contextParentFrame) {
		// 	var frameRect = contextParentFrame.getBoundingClientRect();
		// 	topPos += frameRect.top;
		// 	leftPos += frameRect.left;
		// }

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



})(terafm.context, terafm.ui, terafm.help);