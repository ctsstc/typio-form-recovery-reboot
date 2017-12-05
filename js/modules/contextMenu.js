window.terafm = window.terafm || {};
terafm.contextMenu = {};

(function(contextMenu, ui, help) {
	'use strict';

	var menuNode,

		contextmenuVisible = false,
		contextTarget;

	contextMenu.show = function() {
		menuNode.classList.remove('hidden');
		contextmenuVisible = true;
	};

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


		html += '<li class="link" data-browse-all>Browse all saved data</li>';

		menuNode.querySelector('ul').innerHTML = html;
	};

	contextMenu.position = function(coordinates) {
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
			safeString = help.encodeHTML(revision.value).substring(0,50),
			html = '';

		html = `
		<li data-session="`+ sessionId +`" data-editable="`+ editableId +`" ` + (isOther ? 'data-rec-other' : '') + `>
			`+ (!isOther ? `match:<span data-set-single-entry class="tera-icon-right tera-icon-single" title="Recover just this input"></span>` : '') + `
			`+ safeString +`
		</li>
		`;
		return html;
	}

})(terafm.contextMenu, terafm.ui, terafm.help);