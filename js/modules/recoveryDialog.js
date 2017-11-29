window.terafm = window.terafm || {};
terafm.recoveryDialog = {};

(function(recoveryDialog, db, editableManager, ui, help, options) {
	'use strict';

	var dialogNode; // New

	recoveryDialog.show = function(setDefault) {
		if(setDefault === undefined) recoveryDialog.setPage('default');
		dialogNode.classList.add('open');
	}

	recoveryDialog.setPage = function(pageId) {
		var currHeader = dialogNode.querySelector('.header .header-partial.partial-current'),
			newHeader = dialogNode.querySelector('.header .header-partial.partial-' + pageId),

			currContent = dialogNode.querySelector('.content .content-partial.partial-current'),
			newContent = dialogNode.querySelector('.content .content-partial.partial-' + pageId);

		currHeader.classList.remove('partial-current');
		currContent.classList.remove('partial-current');

		newHeader.classList.add('partial-current');
		newContent.classList.add('partial-current');
	}

	recoveryDialog.hide = function() {
		if(dialogNode) {
			dialogNode.classList.remove('open');
		}
	}

	recoveryDialog.build = function(callback) {
		if(!dialogNode) {
			ui.inject({
				path: 'templates/dialog.tpl',
				returnNode: '.dialog-root'
			}, {
				'{{ hostname }}' : window.location.hostname
			}, function(retnode) {
				dialogNode = retnode;
				dialogNode.querySelector('#hideSmallEntries').checked = options.get('hideSmallEntries');
				requestAnimationFrame(() => callback(retnode));
			});
		} else {
			callback(dialogNode);
		}
	}

	recoveryDialog.populate = function(data) {
		let html = '';

		if(Object.keys(data).length > 0) {

			sortObjectByKey(data, function(k, v) {
				html += generateListGroupHTML(k, v)
			})
			
		} else {
			html += '<p style="margin: 20px;">Nothing saved yet, buddy!</p>';
		}

		dialogNode.querySelector('.recovery-container').innerHTML = html;
	}

	recoveryDialog.setRevision = function(revision, editableId, session) {

		// These nodes will be updated
		let fulltextNode = dialogNode.querySelector('.content .partial-recover .full-text .container'),
			dateNode = dialogNode.querySelector('.content .partial-recover .meta .date'),
			sizeNode = dialogNode.querySelector('.content .partial-recover .meta .size'),
			pathNode = dialogNode.querySelector('.content .partial-recover .editable-path');


		// Get revision data
		let revisionValue = help.encodeHTML(revision.value);
		
		// Make data pretty before we update the dom
		let prettyDate = help.prettyDateFromTimestamp(session),
			prettyDateFull = new Date(session*1000).toString(),
			wordCount = revisionValue.split(/\s/).length + ' words',
			healthStatus = editableManager.resolvePath(revision.path) ? true : false;
		
		revisionValue = revisionValue.replace(/[\r\n]/gm, '<br/>');

		fulltextNode.innerHTML = revisionValue;
		dateNode.innerHTML = prettyDate;
		dateNode.title = prettyDateFull;
		sizeNode.innerHTML = wordCount;
		pathNode.innerHTML = revision.path;

		if(healthStatus) {
			dialogNode.classList.add('health-ok');
		} else {
			dialogNode.classList.remove('health-ok');
		}
	}

	function generateListGroupHTML(timestamp, data) {
		let html = '',
			prettyDate = help.prettyDateFromTimestamp(timestamp);

		html += '<ul data-pretty-date="'+ prettyDate +'">';

			for(let editableId in data) {
				html += generateListItemHTML(data[editableId], editableId, timestamp)
			}

		html += '</ul>';

		return html;
	}

	function generateListItemHTML(item, editableId, sessionId) {
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




})(terafm.recoveryDialog, terafm.db, terafm.editableManager, terafm.ui, terafm.help, terafm.options);