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
			html += generateListGroup(data.sess, 'sess');
			html += generateListGroup(data.recent, 'single');
		} else {
			html += '<p>No entries found for this input field</p>'
		}

		html += '<ul class="footer">';
			html += '<li class="fill" data-action="browse-all">Browse all entries</li>';
			html += '<li class="flex-icon" data-action="keyboard-shortcuts" data-tooltip="Show keyboard shortcuts"><span class="icon-keyboard"></span></li>';
			html += '<li class="flex-icon" data-action="disable-site" data-tooltip="Disable Typio on this site"><span class="icon-block"></span></li>';
		html += '</ul>';

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


	function generateListGroup(entrylist, type) {
		let html = '';

		for(let eid in entrylist.entries) {
			let entry = entrylist.entries[eid];
			let val = entry.getValue({encode: true, truncate: 50});

			if(type === 'sess') {
				var count = entry.session.length;
			}

			html += `<li data-action="restore-${type}" data-group="${type}" data-eid="${eid}">`;
				html += `<div class="value">${val}</div>`;
				html += type === 'single' ? `<!--<div class="flex-icon" title="Restore this entry (this entry was typed in another field)"><span class="icon-arrow-forward"></span></div>-->` :
											`<div class="flex-icon" data-action="restore-sess" data-group="single" data-eid="${eid}" title="Restore just this entry"><span class="custom-icon-session">${count}</span></div>`;
			html += `</li>`;
		}

		if(html.length) {
			return `<ul class="entry-list">${html}</ul>`;
		}

		return '';
	}

})(terafm.quickAccess, terafm.ui, terafm.help);