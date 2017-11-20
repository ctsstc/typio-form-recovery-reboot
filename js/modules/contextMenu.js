window.terafm = window.terafm || {};
terafm.contextMenu = {};

(function(contextMenu, ui, help) {
	'use strict';

	var shroot,
		menuNode,

		contextmenuVisible = false,
		contextTarget;

	contextMenu.show = function() {

		var container = shroot.querySelector('#contextmenu'); // Todo: Use menuNode instead of shroot querysel
		container.classList.remove('hidden');
		contextmenuVisible = true;
	};

	contextMenu.populate = function(data) {
		var html = '';

		Object.keys(data.match).map(sid => {
			html += generateListItemHtml(sid, data.match[sid], false);
		})

		Object.keys(data.other).map(sid => {
			html += generateListItemHtml(sid, data.other[sid], true);
		})

		if(data.length === 0) {
			html += '<li>No entries found for this input field</li>'
		}
		html += '<li class="link" data-browse-all>Browse all saved data</li>';

		// menuNode.querySelector('ul').innerHTML = html;
		shroot.querySelector('ul').innerHTML = html;
	};

	contextMenu.position = function(coordinates) {
		shroot.querySelector('#contextmenu').style = 'top: '+ coordinates.y +'px; left: '+ coordinates.x +'px;';
	}

	contextMenu.hide = function() {
		if(!contextmenuVisible) return;
		var container = shroot.querySelector('#contextmenu'); // Todo: Use menuNode instead of shroot querysel
		container.classList.add('hidden');
		contextmenuVisible = false;
	};

	// Injects HTML
	contextMenu.build = function(callback) {
		if(!shroot) {
			shroot = ui.getShadowRoot();
			injectContextHTML(function() {
				menuNode = shroot.querySelector('#contextmenu');
				callback(menuNode);
			});
		} else {
			callback(menuNode);
		}
	}





	function generateListItemHtml(sessionId, revision, isOther) {
		
		let editableId = terafm.editableManager.generateEditableId(revision.path),
			safeString = help.encodeHTML(revision.value).substring(0,50);

		let html = '';
		html = `
		<li data-session="`+ sessionId +`" data-editable="`+ editableId +`" ` + (isOther ? 'data-rec-other' : '') + `>
			`+ (!isOther ? `match:<span data-set-single-entry class="tera-icon-right tera-icon-single" title="Recover just this input"></span>` : '') + `
			`+ safeString +`
		</li>
		`;
		return html;
	}

	function injectContextHTML(callback) {
		var template = chrome.runtime.getURL('templates/contextmenu.tpl');

		var request = fetch(template).then(response => response.text());

		request.then(function(text) {
			shroot.querySelector('div').insertAdjacentHTML('beforeend', text);
			callback();
		});
	}

})(terafm.contextMenu, terafm.ui, terafm.help);