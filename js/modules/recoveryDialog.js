window.terafm = window.terafm || {};
terafm.recoveryDialog = {};

(function(recoveryDialog, db, editableManager, ui, help, options) {
	'use strict';

	var dialogNode;

	recoveryDialog.show = function(setDefault) {
		ui.touch();
		if(setDefault === undefined) recoveryDialog.setPage('default');
		dialogNode.classList.add('open');
	}

	recoveryDialog.isShowing = function() {
		return dialogNode && dialogNode.classList.contains('open');
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
				'{{ hostname }}' : 						window.location.hostname,
				'{{ keybindRestorePreviousSession }}' : help.prettyKeys(options.get('keybindRestorePreviousSession')),
				'{{ keybindToggleRecDiag }}' : 			help.prettyKeys(options.get('keybindToggleRecDiag'))
			}, function(retnode) {
				dialogNode = retnode;
				dialogNode.querySelector('#hideSmallEntries').checked = options.get('hideSmallEntries');
				requestAnimationFrame(() => {
					requestAnimationFrame(() => callback(retnode));
				});
			});
		} else {
			callback(dialogNode);
		}
	}

	recoveryDialog.animateContentPartial = function() {
		let currPartial = dialogNode.querySelector('.content .content-partial.partial-current');
		currPartial.style.animation = 'none';
		currPartial.offsetHeight; // Trigger reflow
		currPartial.style.animation = null;
	}

	recoveryDialog.populate = function(data) {
		let html = '';

		dialogNode.querySelector('.small-entries-filler').innerHTML = data.skipCount;

		if(Object.keys(data.sessions).length > 0) {

			sortObjectByKey(data.sessions, function(k, v) {
				html += generateListGroupHTML(k, v)
			})
			
		} else {
			html += '<p style="margin: 20px;">Nothing saved yet, buddy!</p>';
		}

		dialogNode.querySelector('.left-pane .content .recovery-container').innerHTML = html;
	}

	recoveryDialog.setRevision = function(revision, editableId, session) {

		// These nodes will be updated
		let fulltextNode = dialogNode.querySelector('.content .partial-recover .full-text .container'),
			dateNode = dialogNode.querySelector('.content .partial-recover .meta .date'),
			typeNode = dialogNode.querySelector('.content .partial-recover .meta .type'),
			pathNode = dialogNode.querySelector('.content .partial-recover .editable-path');
		
		// Make data pretty before we update the dom
		let prettyDate = help.prettyDateFromTimestamp(session),
			prettyDateFull = new Date(session*1000).toString(),
			healthStatus = editableManager.resolvePath(revision.path) ? true : false,
			revisionValue = generateEntryValue(revision).replace(/[\r\n]/gm, '<br/>');

		fulltextNode.innerHTML = revisionValue;
		dateNode.innerHTML = prettyDate;
		dateNode.title = prettyDateFull;
		typeNode.innerHTML = revision.type;
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

		if(timestamp == db.sessionId()) {
			prettyDate = 'Current session';
		}

		html += '<ul data-pretty-date="'+ prettyDate +'">';

			for(let editableId in data) {
				html += generateListItemHTML(data[editableId], editableId, timestamp)
			}

		html += '</ul>';

		return html;
	}

	function generateListItemHTML(item, editableId, sessionId) {

		let excerpt = generateEntryValue(item, 220),
			html = '';

		html += '<li data-set-current="" data-editable="'+ editableId +'" data-session="'+ sessionId +'">';
			html += '<p class="excerpt">' + excerpt + '</p>';
			html += '<div class="meta-bar">';
				html += (item.type ? 'Type: ' + item.type + ' | ' : '') + '<a>Details</a> |  <a class="del-link" data-delete-single="" data-editable="'+ editableId +'" data-session="'+ sessionId +'">Delete entry</a>';
			html += '</div>';
		html += '</li>';

		return html;
	}

	function generateEntryValue(entry, truncate) {
		let value = '';

		if(entry.type === 'radio' && entry.meta) {
			// Meta contains name:value, we don't care about the value here (its always 1 because its selected)
			value += entry.meta; 

		} else if(entry.type === 'checkbox' && entry.meta) {
			value += entry.meta + (entry.value == '1' ? ' (checked)' : ' (unchecked)');

		} else if(entry.meta) {
			value += entry.meta + ': ' + help.encodeEntry(entry);

		} else {
			value += help.encodeEntry(entry);
		}

		if(typeof truncate === 'number') {
			value = value.substring(0, truncate);

			if(value.length > truncate) {
				value += '...';
			}
		}

		return value;
	}

	function sortObjectByKey(data, callback) {
		var keys = Object.keys(data);
		keys.sort().reverse();

		keys.forEach(function(key) {
			callback(key, data[key]);
		});
	}




})(terafm.recoveryDialog, terafm.db, terafm.editableManager, terafm.ui, terafm.help, terafm.options);