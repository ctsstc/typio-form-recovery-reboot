window.terafm = window.terafm || {};
terafm.recoveryDialog = {};

(function(recoveryDialog, db, editableManager, ui, help, options) {
	'use strict';

	var dialogNode,
		dataContainer,
		currPage;

	recoveryDialog.show = function() {
		ui.touch();
		document.activeElement.blur();
		recoveryDialog.setPage('default');
		dialogNode.classList.add('open');
	}

	recoveryDialog.isShowing = function() {
		return dialogNode && dialogNode.classList.contains('open');
	}

	recoveryDialog.hide = function() {
		if(dialogNode) {
			dialogNode.classList.remove('open');
		}
	}

	recoveryDialog.setPage = (pid) => {
		remCurrPage();
		currPage = dialogNode.querySelector('.page-' + pid);
		if(currPage) {
			currPage.classList.add('page-current');
		}
	};

	recoveryDialog.setEntry = (entry) => {
		recoveryDialog.setPage('entry');
		dialogNode.querySelector('#entry-text').innerText = entry.getValue({encode: true});
		dialogNode.querySelector('#entry-path').innerText = entry.obj.path;
	}

	function remCurrPage() {
		if(currPage) currPage.classList.remove('page-current');
	}

	recoveryDialog.build = function(callback) {
		if(!dialogNode) {
			ui.inject({
				path: 'templates/dialog.tpl',
				returnNode: '#recovery-dialog'
			}, {
				'{{ hostname }}' : window.location.hostname
			}, function(retnode) {
				dialogNode = retnode;
				dataContainer = dialogNode.querySelector('.session-data');
				// dialogNode.querySelector('#hideSmallEntries').checked = options.get('hideSmallEntries'); // Todo: Fix
				requestAnimationFrame(() => {
					requestAnimationFrame(() => callback(retnode));
				});
			});
		} else {
			callback(dialogNode);
		}
	}


	recoveryDialog.populate = (sesslist) => {
		let html = '';
		sesslist.each((sess) => {
			makeSess(sess);
		});
		dataContainer.innerHTML = html;

		function makeSess(sess) {
			html += '<p class="date-stamp">' + sess.prettyDate() + '</p>';
			html += '<ul class="card-1">';
			sess.each(entry => {
				makeEntry(entry);
			})
			html += '</ul>';
		}

		function makeEntry(entry) {
			html += '<li data-session-id="'+ entry.sessionId +'" data-editable-id="'+ entry.editableId +'">';
				html += '<p>'+ entry.getValue({encode: true, truncate: 50}); +'</p>';
				html += '<div class="meta">';
					html += '<div class="left">';
						html += '<span>' + (entry.hasEditable() ? 'Target found' : 'Target not found') + '</span>';
					html += '</div>';
					html += '<div class="right">';
						html += '<a>More info</a>';
						html += '<a class="danger">Delete entry</a>';
					html += '</div>';
				html += '</div>';
			html += '</li>';
		}
	}

/*	// Todo: Move to entry?
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
	*/

})(terafm.recoveryDialog, terafm.db, terafm.editableManager, terafm.ui, terafm.help, terafm.options);