window.terafm = window.terafm || {};

(function() {

	var dialog,
		currInput, currSess;

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

		var revs = terafm.db.getAllRevisions();

		var sessions = {},
			html = '';

		for(input in revs) {
			for(rev in revs[input]) {
				if(!sessions[rev]) {
					sessions[rev] = [];
				}
				sessions[rev][input] = revs[input][rev];
			}
		}

		for(sess in sessions) {
			
			var iso = new Date(sess*1000).toISOString();
			var time = terafm.helpers.prettyDate(iso) || iso;

			html += '<p class="session-timestamp">'+ time +'</p>';
			html += '<ul>';
			for(input in sessions[sess]) {

				var safeString = terafm.helpers.encodeHTML(sessions[sess][input].value),
					excerpt = safeString.substring(0, 220),
					excerpt = excerpt.length < safeString.length ? excerpt + '...' : excerpt;

				html += '<li data-set-current data-field="'+ input +'" data-session="'+ sess +'">';
					html += excerpt;
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
		}, 200);
		setTimeout(function() {
			dialog.querySelector('.shadow-root').classList.add('open2');
		}, 250);
	}

	function hide() {
		dialog.querySelector('.shadow-root').classList.add('hidden');
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
			
				html += '<div class="left-pane">';
					html += '<div class="top-bar">';
						html += '<p>All saved data for '+ window.location.host +'</p>';
						html += '<span>Close</span>';
					html += '</div>';

					html += '<div class="recovery-container"></div>';
				html += '</div>';

				html += '<div class="right-pane">';
					html += '<div class="top-bar">';
						html += '<button>Recover</button>';
						html += '<button>Recover session</button>';
						html += 'Yesterday at 3:53pm';
					html += '</div>';
					html += '<div class="content-box">';
						html += 'Select an entry to the left.';
					html += '</div>';

				html += '</div>';
			html += '</div>';
		html += '</div>';

		dialog.innerHTML = html;
	}

	function setCurrent(field, session) {
		currInput = field;
		currSess = session;

		var fullrev = terafm.db.getRevisionByInputAndSession(currInput, currSess),
			safeString = terafm.helpers.encodeHTML(fullrev.value);

		setCurrentStatus(true, function() {
			dialog.querySelector('.right-pane .content-box').innerHTML = safeString;
		})

	}

	function setupEventListeners() {
		dialog.addEventListener('click', function(e) {

			if(e.path[0].classList.contains('trigger-close-dialog')) {
				hide();

			} else if(e.path[0].dataset.setCurrent !== undefined) {
				var li = e.path[0];
				setCurrent(li.dataset.field, li.dataset.session);
			}
		}, true);

		dialog.querySelector('.dialog-overlay').addEventListener('click', function(e) {
			console.log('clicked', e)
			hide();
		})
	}

})();