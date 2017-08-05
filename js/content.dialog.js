window.terafm = window.terafm || {};

(function() {

	var dialog,
		currSelected = {};

	window.terafm.dialog = {
		setup: function() {
			if(!dialog) {
				injectShadowRoot();
				injectDialogHTML();
				setupEventListeners();
			}
		},
		open: function() {
			populate();
			open();
		}
	}

	function populate() {

		var sessionData = terafm.db.getAllRevisionsGroupedBySession(),
			sortedSessionIds = Object.keys(sessionData).reverse(),
			html = '';

		console.log(sessionData);

		for(sid in sortedSessionIds) {

			var sess = sortedSessionIds[sid],
				prettyTime = terafm.helpers.prettyDateFromTimestamp(sess);

			html += '<p class="session-timestamp">'+ prettyTime +'</p>';
			html += '<ul>';
			for(input in sessionData[sess]) {

				var safeString = terafm.helpers.encodeHTML(sessionData[sess][input].value),
					excerpt = safeString.substring(0, 220),
					excerpt = excerpt.length < safeString.length ? excerpt + '...' : excerpt,
					wordCount = (safeString + '').split(/\s/).length;

				html += '<li data-set-current data-field="'+ input +'" data-session="'+ sess +'">';
					html += '<p class="excerpt">' + excerpt + '</p>';
					html += '<div class="meta-bar">';
						html += '<a href="#">Details</a> | ' + wordCount + ' words';
					html += '</div>';
				html += '</li>';
			}

			html += '</ul>';
		}

		dialog.querySelector('.recovery-container').innerHTML = html;
	}

	function open() {
		dialog.querySelector('.shadow-root').classList.remove('hidden');

		setTimeout(function() {
			dialog.querySelector('.shadow-root').classList.add('open');
		}, 10);
	}

	function hide() {
		dialog.querySelector('.shadow-root').classList.add('hidden');
		dialog.querySelector('.shadow-root').classList.remove('open');
	}

	function setCurrentStatus(status, callback) {
		if(status) {
			setCurrentStatus(false);
			setTimeout(function() {
				dialog.querySelector('.shadow-root').classList.add('current-loaded');
				callback();
			}, 200);
		} else {
			dialog.querySelector('.shadow-root').classList.remove('current-loaded');
		}
	}

	function injectShadowRoot() {
		document.body.insertAdjacentHTML('afterbegin', '<div id="terafm-dialog"></div>');

		console.log('creating dialog')
		var shadowRoot = document.getElementById('terafm-dialog').createShadowRoot({mode: 'open'});
		dialog = shadowRoot;
	}

	function injectDialogHTML() {
		var diagCSSPath = chrome.runtime.getURL('css/content.dialog.css');

		var html = '';
		html += '<style> @import url("'+ diagCSSPath +'"); </style>';

		html += '<div class="shadow-root hidden">';
			html += '<div class="dialog-overlay"></div>';
			html += '<div class="dialog-container">';

				html += '<div class="top-bar">';
					html += 'Typio Form Recovery';
					html += '<span style="float: right;">Close</span>';
				html += '</div>';
			
				html += '<div class="left-pane">';
					html += '<div class="header">';
						html += '<p class="domain">Recover '+ window.location.host +' <span data-set-page="settings" style="float: right;">[S]</span></p>';
					html += '</div>';
					html += '<div class="recovery-container"></div>';
				html += '</div>';

				html += '<div class="right-pane">';

					html += '<div class="page page-recover">';
						html += '<div class="header">';
							html += '<button data-recover>Recover</button>';
							html += '<button data-recover-session>Recover session</button>';
							html += '<p class="stats"> <span class="date"></span> <span class="size"></span> <span class="health"></span> </p>';
						html += '</div>';
						html += '<div class="content-box">';
							html += 'Select an entry to the left.';
						html += '</div>';
					html += '</div>';

					html += '<div class="page page-current page-home">HOME';
					html += '</div>';

					html += '<div class="page page-settings">SETTINGS';
					html += '</div>';

				html += '</div>';
			html += '</div>';
		html += '</div>';

		dialog.innerHTML = html;
	}

	function setCurrent(field, session) {

		currSelected.editableId = field;
		currSelected.session = session;

		var fullrev = terafm.db.getSingleRevisionByEditableAndSession(currSelected.editableId, currSelected.session),
			safeString = terafm.helpers.encodeHTML(fullrev.value);

		currSelected.editablePath = fullrev.path;
		currSelected.editableValue = fullrev.value;

		setCurrentStatus(true, function() {
			dialog.querySelector('.right-pane .content-box').innerHTML = safeString;
			dialog.querySelector('.right-pane .stats .date').innerHTML = terafm.helpers.prettyDateFromTimestamp(currSelected.session);
			dialog.querySelector('.right-pane .stats .size').innerHTML = (fullrev.value + "").split(/\s/).length + ' words';
			dialog.querySelector('.right-pane .stats .health').innerHTML = document.querySelector(currSelected.editablePath) ? 'OK' : 'NOT FOUND';
		})

	}

	function setPage(pageId) {
		var currPage = dialog.querySelector('.right-pane .page-current'),
			newPage = dialog.querySelector('.right-pane .page-' + pageId);

		if(newPage) {
			currPage.classList.remove('page-current');
			setTimeout(function() {
				newPage.classList.add('page-current');
			}, 200);
		}
	}

	function setupEventListeners() {
		dialog.addEventListener('click', function(e) {

			var target = e.path[0];

			if(target.classList.contains('trigger-close-dialog')) {
				hide();

			} else if(target.dataset.setCurrent !== undefined || target.parentElement.dataset.setCurrent !== undefined) {
				var li = target.dataset.setCurrent !== undefined ? li : target.parentElement;
				setCurrent(li.dataset.field, li.dataset.session);
				setPage('recover');
				var old = dialog.querySelector('.recovery-container .current');
				if(old) {
					old.classList.remove('current');
				}
				li.classList.add('current');

			} else if(target.dataset.setPage !== undefined) {
				setPage(target.dataset.setPage);
			
			} else if(target.dataset.recover !== undefined) {

				var target = document.querySelector(currSelected.editablePath);
				if(target) {
					terafm.editableManager.setEditableValue(target, currSelected.editableValue)
					hide();
				}

			} else if(target.dataset.recoverSession !== undefined) {
				var session = terafm.db.getRevisionsBySession(currSelected.session),
					fails = 0;
					
				session.forEach(function(editable) {
					var target = document.querySelector(editable.path);
					if(target) {
						terafm.editableManager.setEditableValue(target, editable.value);
					} else {
						fails += 1;
					}
				});

				if(fails !== 0) {
					console.log(fails, ' out of '+ session.length +' fields could not be recovered');
				}

				hide();
			}


		}, true);

		dialog.querySelector('.dialog-overlay').addEventListener('click', function(e) {
			hide();
		})

		dialog.querySelector('.recovery-container').addEventListener('scroll', function(e) {
			var elem = e.path[0];

			if(elem.scrollTop > 0) {
				elem.classList.add('scroll-not-top');
			} else {
				elem.classList.remove('scroll-not-top');
			}
		});
	}

})();