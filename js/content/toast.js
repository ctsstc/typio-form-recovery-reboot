window.terafm = window.terafm || {};

(function() {

	var init = false;

	var isInitiated = false;

	var shroot;
	var timeout;

	window.terafm.toast = {
		create: function(text, duration) {
			setup(function() {
				showToast(text, duration);
			});
		},
		close: function() {
			hideDialog();
		}
	}

	function showToast(text, duration) {
		var toast = shroot.querySelector('.toast');
		toast.innerHTML = text;
		toast.classList.remove('hidden');

		clearTimeout(timeout);
		timeout = setTimeout(function() {
			hideToast();
		}, duration || 2000);
	}

	function hideToast() {
		var toast = shroot.querySelector('.toast');
		toast.classList.add('hidden');
	}

	function setup(callback) {

		if(isInitiated === true) {
			callback();
			return;
		}

		shroot = terafm.getShadowRoot();
		injectHTML(function() {
			isInitiated = true;
			setTimeout(function() {
				callback();
			}, 20);
		});
	}


	function injectHTML(callback) {
		var template = chrome.runtime.getURL('templates/toast.tpl');

		var request = fetch(template).then(response => response.text());

		request.then(function(text) {
			shroot.querySelector('div').insertAdjacentHTML('beforeend', text);
			callback();
		});
		
	}

})();