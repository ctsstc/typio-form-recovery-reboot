window.terafm = window.terafm || {};
terafm.quickAccess = {};

(function(quickAccess, ui, help) {
	'use strict';

	var menuNode,

		quickAccessVisible = false;

	quickAccess.show = function() {
		ui.touch();
		menuNode.classList.remove('hidden');
		quickAccessVisible = true;
	};

	quickAccess.isOpen = function() {
		return quickAccessVisible;
	}

	quickAccess.populate = function(data) {
		var html = '';

		if(!data.empty) {
			html += generateListItemHtml(data.sess, 'sess');
			html += generateListItemHtml(data.recent, 'single');

		} else {
			html += '<li><span class="entry-text">No entries found for this input field</span></li>'
		}

		html += '<div class="flex">';
			html += '<li data-action="browse-all">Browse all entries</li>';
			html += '<li data-action="keyboard-shortcuts" class="icon icon-keyboard" data-tooltip="Show keyboard shortcuts"></li>';
			html += '<li data-action="disable-site" class="icon icon-blacklist" data-tooltip="Disable Typio on this site"></li>';
		html += '</div>';

		menuNode.querySelector('ul').innerHTML = html;
	};

	quickAccess.position = function(edrect) {
		var popupHeight = menuNode.clientHeight,
			popupWidth = menuNode.clientWidth,
			pos = {x: edrect.x, y: edrect.y}

		if(document.body.scrollHeight > 0 && edrect.y + popupHeight > Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight) ) {
			pos.y -= popupHeight;
		}

		if(edrect.x + (edrect.width||0) + popupWidth > Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth) ) {
			pos.x -= popupWidth;
		} else {
			pos.x += edrect.width||0;
		}

		menuNode.style = 'top: '+ pos.y +'px; left: '+ pos.x +'px;';
	}

	quickAccess.hide = function() {
		if(!quickAccessVisible) return;
		menuNode.classList.add('hidden');
		quickAccessVisible = false;
	};

	// Injects HTML
	quickAccess.build = function(callback) {
		if(!menuNode) {
			ui.inject({
				path: 'templates/quickAccess.tpl',
				returnNode: '#quickAccess'
			}, function(resnode) {
				menuNode = resnode;
				callback(resnode);
			});
		} else {
			callback(menuNode);
		}
	}


	function generateListItemHtml(entrylist, type) {
		let html = '';

		for(let eid in entrylist.entries) {
			let entry = entrylist.entries[eid];
			let val = entry.getValue({encode: true, truncate: 50});

			if(type === 'sess') {
				var count = entry.session.length;
			}

			html += `<li data-action="restore-${type}" data-group="${type}" data-eid="${eid}">`;
				html += `<span class="entry-text">${val}</span>`;
				html += type === 'single' ? `<span class="entry-icon icon-chevron" title="Restore this entry (this entry was typed in another field)"></span>` :
											`<span data-action="restore-sess" data-group="single" data-eid="${eid}" class="entry-icon icon-count" title="Restore just this entry">${count}</span>`;
			html += `</li>`;
		}
			
		return html;
	}

})(terafm.quickAccess, terafm.ui, terafm.help);