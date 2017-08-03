window.terafm = window.terafm || {};

(function() {

	var dialogs = {};

	window.terafm.dialog = {

		create: function(id, header, content) {
			if(!(id in dialogs)) {
				injectShadowRoot(id);
				injectDialogHTML(id);
				setupEventListeners(id);
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
		var cssPath = chrome.runtime.getURL('css/content.dialog.css');

		var html = '';
		html += '<style> @import url("'+ cssPath +'"); </style>';
		html += '<div class="tera-dialog hidden">';
			html += '<div id="header"></div>';
			html += '<div id="content"></div>';
		html += '</div>';

		dialogs[id].innerHTML = html;
	}

})();