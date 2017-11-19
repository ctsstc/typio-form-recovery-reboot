window.terafm = window.terafm || {};
terafm.recoveryDialog = {};

(function(recoveryDialog, db, editableManager, ui, help) {
	'use strict';

	var shroot;

	recoveryDialog.show = function() {
		var shadowRoot = shroot.querySelector('.dialog-root');
		shadowRoot.classList.add('open');
	}

	recoveryDialog.setPage = function(pageId) {
		var currHeader = shroot.querySelector('.header .header-partial.partial-current'),
			newHeader = shroot.querySelector('.header .header-partial.partial-' + pageId),

			currContent = shroot.querySelector('.content .content-partial.partial-current'),
			newContent = shroot.querySelector('.content .content-partial.partial-' + pageId);

		currHeader.classList.remove('partial-current');
		currContent.classList.remove('partial-current');

		newHeader.classList.add('partial-current');
		newContent.classList.add('partial-current');
	}

	recoveryDialog.hide = function() {
		if(shroot) {
			var shadowRoot = shroot.querySelector('.dialog-root');

			shadowRoot.classList.remove('open');
		}
	}

	recoveryDialog.build = function(callback) {
		if(!shroot) {
			shroot = ui.getShadowRoot();
			injectDialogHTML(function() {
				setTimeout(function() {
					callback(shroot);
				}, 50);
			});
		} else {
			callback(shroot);
		}
	}

	recoveryDialog.populate = function(data) {
		let html = '';

		sortObjectByKey(data, function(k, v) {
			html += generateListGroupHTML(k, v)
		})

		shroot.querySelector('.recovery-container').innerHTML = html;
	}

	recoveryDialog.setRevision = function(revision, editableId, session) {

		// These nodes will be updated
		let fulltextNode = shroot.querySelector('.content .partial-recover .full-text .container'),
			dateNode = shroot.querySelector('.content .partial-recover .meta .date'),
			sizeNode = shroot.querySelector('.content .partial-recover .meta .size'),
			pathNode = shroot.querySelector('.content .partial-recover .editable-path');


		// Get revision data
		let revisionValue = help.encodeHTML(revision.value);
		
		// Make data pretty before we update the dom
		let prettyDate = help.prettyDateFromTimestamp(session),
			prettyDateFull = new Date(session*1000).toString(),
			wordCount = revisionValue.split(/\s/).length + ' words',
			healthStatus = editableManager.getEditableByPath(revision.path, revision.frame) ? true : false;
		
		revisionValue = revisionValue.replace(/[\r\n]/gm, '<br/>');

		fulltextNode.innerHTML = revisionValue;
		dateNode.innerHTML = prettyDate;
		dateNode.title = prettyDateFull;
		sizeNode.innerHTML = wordCount;
		pathNode.innerHTML = (revision.frame ? revision.frame + '<br/>' : '') + revision.path;

		if(healthStatus) {
			shroot.querySelector('.dialog-root').classList.add('health-ok');
		} else {
			shroot.querySelector('.dialog-root').classList.remove('health-ok');
		}
	}

	function generateListGroupHTML(timestamp, data) {
		let html = '',
			prettyDate = help.prettyDateFromTimestamp(timestamp);

		html += '<ul data-pretty-date="'+ prettyDate +'">';

			if(data) {
				for(let editableId in data) {
					html += generateListItemHTML(data[editableId], editableId, timestamp)
				}
			} else {
				html += '<p style="margin: 20px;">Nothing saved yet, buddy!</p>';
			}

		html += '</ul>';

		return html;
	}

	function generateListItemHTML(item, editableId, sessionId) {
		// console.log(item, editableId, sessionId);
		let safeString = help.encodeHTML(item.value),
			excerpt = safeString.substring(0, 220),
			wordCount = (safeString + '').split(/\s/).length,
			html = '';

		excerpt = excerpt.length < safeString.length ? excerpt + '...' : excerpt;

		html += '<li data-set-current data-editable="'+ editableId +'" data-session="'+ sessionId +'">';
			html += '<p class="excerpt">' + excerpt + '</p>';
			html += '<div class="meta-bar">';
				html += wordCount + ' words | <a>Details</a> |  <a class="del-link" data-delete-single data-editable="'+ editableId +'" data-session="'+ sessionId +'">Delete entry</a>';
			html += '</div>';
		html += '</li>';

		return html;
	}

	function sortObjectByKey(data, callback) {
		var keys = Object.keys(data);
		keys.sort().reverse();

		keys.forEach(function(key) {
			callback(key, data[key]);
		});
	}


	function injectDialogHTML(callback) {
		var template = chrome.runtime.getURL('templates/dialog.tpl');

		var request = fetch(template).then(response => response.text());

		request.then(function(text) {
			text = text.replace('{{ hostname }}', window.location.hostname);
			shroot.querySelector('div').insertAdjacentHTML('beforeend', text);
			callback();
		});
	}




})(terafm.recoveryDialog, terafm.db, terafm.editableManager, terafm.ui, terafm.help);