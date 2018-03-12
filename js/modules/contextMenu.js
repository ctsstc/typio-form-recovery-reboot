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
		html += '<li data-browse-all="">Browse all entries</li>';
		html += '<li class="icon icon-keyboard" data-keyboard-shortcuts="" data-tooltip="Show keyboard shortcuts"></li>';
		html += '<li class="icon icon-blacklist" data-disable-site="" data-tooltip="Disable Typio on this site"></li>';
		html += '</div>';

		menuNode.querySelector('ul').innerHTML = html;
	};

	contextMenu.position = function(coordinates) {
		var padding = 20,
			height = menuNode.clientHeight,
			width = menuNode.clientWidth;

		if( (coordinates.y + height + padding) > Math.max(document.body.scrollHeight, document.body.offsetHeight) ) {
			coordinates.y -= height + 20;
		}

		if( (coordinates.x + width + padding) > Math.max(document.body.scrollWidth, document.body.offsetWidth) ) {
			coordinates.x -= width;
		}

		menuNode.style = 'top: '+ coordinates.y +'px; left: '+ coordinates.x +'px;';
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


	function generateListItemHtml(sessionId, revision, isOther) {

		let editableId = terafm.editableManager.generateEditableId(revision.path),
			safeString = help.encodeEntry(revision).substring(0,50),
			html = '';

		if(!isOther) {
			var count = terafm.db.getRevisionsBySession(sessionId).length;
		}

		html =	`<li title="`+ (!isOther ? `Restore all entries from this session` : `Restore this entry`) +`" data-session="`+ sessionId +`" data-editable="`+ editableId +`" ` + (isOther ? 'data-rec-other=""' : '') + `>` +
					safeString +
					(!isOther ? `<span data-set-single-entry="" class="icon-right" title="Restore only this entry">` + count + `</span>` : '') +
				`</li>`;
		return html;
	}

})(terafm.contextMenu, terafm.ui, terafm.help);