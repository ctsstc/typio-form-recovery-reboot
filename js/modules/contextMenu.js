window.terafm = window.terafm || {};
terafm.contextMenu = {};

(function(contextMenu, ui, help) {
	'use strict';

	var menuNode,

		contextmenuVisible = false;

	contextMenu.show = function() {
		ui.touch();
		menuNode.classList.remove('hidden');
		contextmenuVisible = true;
	};

	contextMenu.isOpen = function() {
		return contextmenuVisible;
	}

	contextMenu.populate = function(data) {
		var html = '';

		if(!data.empty) {
			Object.keys(data.match).reverse().map(sid => {
				html += generateListItemHtml(sid, data.match[sid], false);
			})

			Object.keys(data.other).reverse().map(sid => {
				Object.keys(data.other[sid]).map(eid => {
					html += generateListItemHtml(sid, data.other[sid][eid], true);
				})

			})

		} else {
			html += '<li>No entries found for this input field</li>'
		}

		html += '<div class="flex">';
			html += '<li data-action="browse-all">Browse all entries</li>';
			html += '<li data-action="keyboard-shortcuts" class="icon icon-keyboard" data-tooltip="Show keyboard shortcuts"></li>';
			html += '<li data-action="disable-site" class="icon icon-blacklist" data-tooltip="Disable Typio on this site"></li>';
		html += '</div>';

		menuNode.querySelector('ul').innerHTML = html;
	};

	contextMenu.position = function(edrect) {
		var popupHeight = menuNode.clientHeight,
			popupWidth = menuNode.clientWidth,
			pos = {x: edrect.x, y: edrect.y}

		if(edrect.y + popupHeight > Math.max(document.body.scrollHeight, document.body.offsetHeight) ) {
			pos.y -= popupHeight;
		}

		if(edrect.x + (edrect.width||0) + popupWidth > Math.max(document.body.scrollWidth, document.body.offsetWidth) ) {
			pos.x -= popupWidth;
		} else {
			pos.x += edrect.width||0;
		}

		menuNode.style = 'top: '+ pos.y +'px; left: '+ pos.x +'px;';
	}

	contextMenu.hide = function() {
		if(!contextmenuVisible) return;
		menuNode.classList.add('hidden');
		contextmenuVisible = false;
	};

	// Injects HTML
	contextMenu.build = function(callback) {
		if(!menuNode) {
			ui.inject({
				path: 'templates/contextmenu.tpl',
				returnNode: '#contextmenu'
			}, function(resnode) {
				menuNode = resnode;
				callback(resnode);
			});
		} else {
			callback(menuNode);
		}
	}


	function generateListItemHtml(sessionId, revision, isRelated) {

		let editableId = terafm.editableManager.generateEditableId(revision.path),
			safeString = help.encodeEntry(revision).substring(0,50),
			html = '';

		if(!isRelated) {
			var count = terafm.db.getRevisionsBySession(sessionId).length;
		}

		html += isRelated ? `<li data-action="rec-single-related" data-session="${sessionId}" data-editable="${editableId}">` :
							 `<li data-action="rec-session" data-session="${sessionId}">`;

			html += 			`<span class="entry-text">${safeString}</span>`;
			html += isRelated ? `<span class="entry-icon icon-chevron" title="Restore this entry (this entry was typed in another field)"></span>` :
								`<span data-action="rec-single" data-session="${sessionId}" data-editable="${editableId}" class="entry-icon icon-count" title="Restore just this entry">${count}</span>`;
		
		html += `</li>`;
		
		return html;
	}

})(terafm.contextMenu, terafm.ui, terafm.help);