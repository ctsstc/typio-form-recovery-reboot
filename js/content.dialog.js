window.terafm = window.terafm || {};

(function() {

	var dialog,
		currentRevision = {};

	window.terafm.dialog = {
		open: function() {
			setup(function() {
				setPage('default');
				populate();
				openDialog();
			});
		},
		close: function() {
			hideDialog();
		}
	}

	function setup(callback) {
		if(!dialog) {
			injectShadowRoot();
			injectDialogHTML(function() {
				setTimeout(function() {
					setupEventListeners();
					callback();
				}, 50);
			});
		} else {
			callback();
		}
	}

	function populate() {

		var sessionData = terafm.db.getAllRevisionsGroupedBySession(),
			sortedSessionIds = Object.keys(sessionData).reverse(),
			html = '',
			currentSessionId = terafm.db.sessionId();

		if(sortedSessionIds.length) {
			for(sid in sortedSessionIds) {

				// Don't list current
				if(sortedSessionIds[sid] == currentSessionId) {
					continue;
				}

				var sess = sortedSessionIds[sid],
					prettyDate = terafm.helpers.prettyDateFromTimestamp(sess);

				html += '<ul data-pretty-date="'+ prettyDate +'">';
				for(input in sessionData[sess]) {

					var safeString = terafm.helpers.encodeHTML(sessionData[sess][input].value),
						excerpt = safeString.substring(0, 220),
						excerpt = excerpt.length < safeString.length ? excerpt + '...' : excerpt,
						wordCount = (safeString + '').split(/\s/).length;

					html += '<li data-set-current data-editable="'+ input +'" data-session="'+ sess +'">';
						html += '<p class="excerpt">' + excerpt + '</p>';
						html += '<div class="meta-bar">';
							html += wordCount + ' words | <a>Details</a> |  <a class="del-link" data-delete-single data-editable="'+ input +'" data-session="'+ sess +'">Delete entry</a>';
						html += '</div>';
					html += '</li>';
				}

				html += '</ul>';
			}
		} else {
			html += '<p style="margin: 20px;">Nothing saved yet, buddy!</p>';
		}

		dialog.querySelector('.recovery-container').innerHTML = html;
	}

	function openDialog() {
		var shadowRoot = dialog.querySelector('.shadow-root');

		shadowRoot.classList.add('open');
	}

	function hideDialog() {
		if(dialog) {
			var shadowRoot = dialog.querySelector('.shadow-root');

			shadowRoot.classList.remove('open');
		}
	}

	function injectDialogHTML(callback) {
		var diagCSSPath = chrome.runtime.getURL('css/content.dialog.css'),
			template = chrome.runtime.getURL('templates/dialog.tpl');

		var request = fetch(template).then(response => response.text());

		request.then(function(text) {
			text = text.replace('{{ cssPath }}', diagCSSPath);
			text = text.replace('{{ hostname }}', window.location.hostname);
			dialog.innerHTML = text;
			callback();
		});
		
	}

	function injectShadowRoot() {
		document.body.insertAdjacentHTML('beforeend', '<div id="terafm-dialog"></div>');

		var shadowRoot = document.getElementById('terafm-dialog').createShadowRoot({mode: 'open'});
		dialog = shadowRoot;
	}


	function setupEventListeners() {
		dialog.addEventListener('click', function(e) {

			var target = e.path[0];

			// Close dialog trigger
			if(target.classList.contains('trigger-close-dialog')) {
				hideDialog();

			// Delete single entry trigger
 			} else if(target.dataset.deleteSingle !== undefined) {
				var editable = target.dataset.editable,
					session = target.dataset.session;

				terafm.db.deleteSingleRevisionByEditable(editable, session);

				// Entry doesn't exist anymore, go back to default page
				setPage('default');

				var li = target.closest('li'),
					ul = li.parentElement;

				// Remove list item
				ul.removeChild(li);

				// If that was the last list item, remove UL
				if(ul.children.length < 1) {

					// If last list item in last UL, re-populate the whole list (will result in "no entries" message)
					if(ul.children.length === 0 && ul.parentElement.children.length === 1) {
						populate();

					// Remove empty ul (timestamp)
					} else {
						ul.parentElement.removeChild(ul);
					}

				}


			// Set current revision
			} else if(target.dataset.setCurrent !== undefined || target.closest('[data-set-current]')) {
				
				if(target.dataset.setCurrent !== undefined) {
					var listItem = target;
				} else {
					var listItem = target.closest('[data-set-current]');
				}

				var currSelected = listItem.closest('.recovery-container').querySelector('.selected');
				if(currSelected) {
					currSelected.classList.remove('selected');
				}
				listItem.classList.add('selected');

				setRevision(listItem.dataset.editable, listItem.dataset.session);
				setPage('recover');


			// Recover single trigger
			} else if(target.classList.contains('trigger-recover-single')) {
				var target = document.querySelector(currentRevision.editablePath);
				if(target) {
					terafm.editableManager.setEditableValue(target, currentRevision.editableValue);
					terafm.editableManager.flashEditable(target);
					hideDialog();
				} else {
					hideDialog();
					if(confirm('Target element cannot be found, please click where you want to restore the text into.')) {
						clickTargetToRestore(function(newTarget) {
							terafm.editableManager.setEditableValue(newTarget, currentRevision.editableValue);
							terafm.editableManager.flashEditable(newTarget);
						});
					}
				}


			// Recover single to target trigger
			} else if(target.classList.contains('trigger-recover-single-to-target')) {
				hideDialog();
				if(confirm('Click any input field to restore the data into.')) {
					clickTargetToRestore(function(newTarget) {
						terafm.editableManager.setEditableValue(newTarget, currentRevision.editableValue);
						terafm.editableManager.flashEditable(newTarget);
					});
				}
			

			// Recover session trigger
			} else if(target.classList.contains('trigger-recover-session')) {
				var session = terafm.db.getRevisionsBySession(currentRevision.session),
					fails = 0;
					
				session.forEach(function(editable) {
					var target = terafm.editableManager.getEditableByPath(editable.path, editable.frame);
					if(target) {
						terafm.editableManager.setEditableValue(target, editable.value);
						terafm.editableManager.flashEditable(target);
					} else {
						fails += 1;
					}
				});

				if(fails !== 0) {
					alert(fails + ' out of '+ session.length +' fields could not be recovered because their original input elements does not exist anymore. You can still recover the data by selecting "recover to target" in the recovery dialog.');
				}

				hideDialog();
			

			// Set page trigger
			} else if(target.dataset.setPage !== undefined) {
				setPage(target.dataset.setPage);


			// Open extension settings trigger
			} else if(target.classList.contains('trigger-open-extension-settings')) {
				chrome.runtime.sendMessage({action: 'openSettings'});


			// Delete all revisions trigger
			} else if(target.classList.contains('trigger-delete-all')) {
				terafm.db.deleteAllSessions();
				populate();


			// Copy to clipboard trigger
			} else if(target.classList.contains('trigger-copy')) {
				document.body.insertAdjacentHTML('afterbegin', '<textarea id="terafm-copy" style="position: absolute;"></textarea>');
				var copyCont = document.querySelector('#terafm-copy');

				copyCont.value = currentRevision.editableValue;
				copyCont.focus();
				copyCont.select();

				// Give it some time for large texts
				document.execCommand('copy');
				document.body.removeChild(copyCont);

				hideDialog();


			// Add site to blacklist trigger
			} else if(target.classList.contains('trigger-blacklist')) {
				chrome.storage.sync.get('domainBlacklist', function(res) {
					var blacklist = res.domainBlacklist;
					blacklist += window.location.hostname + "\r\n";
					chrome.storage.sync.set({
						domainBlacklist: blacklist
					});
					target.parentElement.insertAdjacentHTML('afterbegin', 'Added to blacklist. Typio will not save any data on ' + window.location.hostname +' anymore. You can enable the extension for this site again by removing it from the blacklist in the extension settings.');
					target.parentElement.removeChild(target);

				});
			}

		});
	}


	function setPage(pageId) {
		var currHeader = dialog.querySelector('.header .header-partial.partial-current'),
			newHeader = dialog.querySelector('.header .header-partial.partial-' + pageId),

			currContent = dialog.querySelector('.content .content-partial.partial-current'),
			newContent = dialog.querySelector('.content .content-partial.partial-' + pageId);

		currHeader.classList.remove('partial-current');
		currContent.classList.remove('partial-current');

		newHeader.classList.add('partial-current');
		newContent.classList.add('partial-current');
	}

	function setRevision(editableId, session) {

		// These nodes will be updated
		var fulltextNode = dialog.querySelector('.content .partial-recover .full-text .container'),
			dateNode = dialog.querySelector('.content .partial-recover .meta .date'),
			sizeNode = dialog.querySelector('.content .partial-recover .meta .size'),
			pathNode = dialog.querySelector('.content .partial-recover .editable-path');


		// Get revision data
		var revision = terafm.db.getSingleRevisionByEditableAndSession(editableId, session),
			revisionValue = terafm.helpers.encodeHTML(revision.value);


		// Used later when recovering
		currentRevision.editablePath = revision.path;
		currentRevision.editableValue = revision.value;
		currentRevision.session = session;

		
		// Make data pretty before we update the dom
		var prettyDate = terafm.helpers.prettyDateFromTimestamp(session),
			prettyDateFull = new Date(session*1000).toString(),
			wordCount = revisionValue.split(/\s/).length + ' words',
			healthStatus = terafm.editableManager.getEditableByPath(revision.path, revision.frame) ? true : false,
			revisionValue = revisionValue.replace(/[\r\n]/gm, '<br/>');

		fulltextNode.innerHTML = revisionValue;
		dateNode.innerHTML = prettyDate;
		dateNode.title = prettyDateFull;
		sizeNode.innerHTML = wordCount;
		pathNode.innerHTML = (revision.frame ? revision.frame + '<br/>' : '') + revision.path;

		if(healthStatus) {
			dialog.querySelector('.shadow-root').classList.add('health-ok');
		} else {
			dialog.querySelector('.shadow-root').classList.remove('health-ok');
		}

	}

	// This needs to be refactored bigtime
	function clickTargetToRestore(callback) {

		terafm.editablePicker.pick(function(editable) {
			callback(editable);
		});
	}

})();