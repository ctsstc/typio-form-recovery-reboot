window.terafm = window.terafm || {};

(function() {

	var dialogs = {};

	window.terafm.dialog = {

		create: function(id, header, content) {
			if(!(id in dialogs)) {
				injectShadowRoot(id);
				injectDialogHTML(id);
				setupEventListeners(id);

				setTimeout(function() {
					dialogs[id].querySelector('.dialog-container').classList.add('open');
				}, 200);
				setTimeout(function() {
					dialogs[id].querySelector('.dialog-container').classList.add('open2');
				}, 250);
			}
		},

		setHeaderHTML: function(id, html) {
			dialogs[id].querySelector('.tera-dialog #header').innerHTML = html;
		},

		setContentHTML: function(id, html) {
			dialogs[id].querySelector('.tera-dialog #content').innerHTML = html;
		},

		show: function(id) {
			dialogs[id].querySelector('.tera-dialog').classList.remove('hidden');
		},

		hide: function(id) {
			dialogs[id].querySelector('.tera-dialog').classList.add('hidden');
		},

		getShadowRoot: function(id) {
			return dialogs[id];
		}

	}

	function setupEventListeners(id) {
		dialogs[id].addEventListener('click', function(e) {
			if(e.path[0].classList.contains('trigger-close-dialog')) {
				terafm.dialog.hide(id);
			}
		}, true);
	}

	function injectShadowRoot(id) {
		var idTarget = 'terafm-dialog-' + id;
		document.body.insertAdjacentHTML('afterbegin', '<div id="'+ idTarget +'"></div>');

		var shadowRoot = document.getElementById(idTarget).createShadowRoot({mode: 'open'});
		dialogs[id] = shadowRoot;
	}

	function injectDialogHTML(id) {
		var diagCSSPath = chrome.runtime.getURL('css/content.dialog.css');

		var html = '';
		html += '<style> @import url("'+ diagCSSPath +'"); </style>';

		html += '<div class="dialog-overlay"></div>';
		html += '<div class="dialog-container">';
		
			html += '<div class="left-pane">';
				html += '<div class="top-bar">';
					html += '<p>All saved data for '+ window.location.host +'</p>';
					html += '<span>Close</span>';
				html += '</div>';

				html += '<div class="recovery-container">';
					html += '<p class="session-timestamp">Yesterday at 3:53pm</p>';
					html += '<ul>';
						html += '<li>Rread property injectHTML of undefined. Uncaught TypeError: Cannot read property injectHTML of undefined read property injectHTML of undefined.</li>';
						html += '<li>Rread property injectHTML of undefined. Uncaught TypeError: Cannot read property injectHTML of undefined read property injectHTML of undefined.</li>';
						html += '<li>Rread property injectHTML of undefined. Uncaught TypeError: Cannot read property injectHTML of undefined read property injectHTML of undefined.</li>';
					html += '</ul>';
					html += '<p class="session-timestamp">Yesterday at 3:53pm</p>';
					html += '<ul>';
						html += '<li>Rread property injectHTML of undefined. Uncaught TypeError: Cannot read property injectHTML of undefined read property injectHTML of undefined.</li>';
						html += '<li>Rread property injectHTML of undefined. Uncaught TypeError: Cannot read property injectHTML of undefined read property injectHTML of undefined.</li>';
						html += '<li>Rread property injectHTML of undefined. Uncaught TypeError: Cannot read property injectHTML of undefined read property injectHTML of undefined.</li>';
					html += '</ul>';
				html += '</div>';
			html += '</div>';

			html += '<div class="right-pane">';
				html += '<div class="top-bar">';
					html += '<button>Recover</button>';
					html += '<button>Recover session</button>';
					html += 'Yesterday at 3:53pm';
				html += '</div>';
				html += '<div class="content-box">';
					html += 'Here is a somewhat small string that is to be recovered maybe possibly.';
				html += '</div>';

			html += '</div>';
		html += '</div>';

		dialogs[id].innerHTML = html;
	}

})();