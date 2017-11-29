window.terafm = window.terafm || {};
terafm.ui = {};

(function(ui) {
	'use strict';

	var shadowRootNode;

	ui.inject = function(data, replaceObj, callback) {

		// Make sure shadow root has been created
		if(!shadowRootNode) {
			createShadowRoot();
		}

		// Make replace arg optional
		if(!callback) {
			callback = replace;
		}

		// If template was passed, fetch template content
		if(data.path) {

			// Complete path will full extenison url
			data.path = chrome.runtime.getURL(data.path);

			var request = fetch(data.path).then(response => response.text());

			request.then(function(text) {
				if(replaceObj) text = replacePlaceholders(text, replaceObj);
				let retnode = addToShadowRoot(text, data.returnNode);
				callback(retnode);
			});


		// Html was passed, insert
		} else if(data.html) {
			if(replaceObj) data.html = replacePlaceholders(data.html, replaceObj);
			let retnode = addToShadowRoot(data.html, data.returnNode);
			callback(retnode);
		}

	}

	function replacePlaceholders(htmlStr, replObj) {
		Object.keys(replObj).map((key) => {
			htmlStr = htmlStr.replace(key, replObj[key]);
		})
		return htmlStr;
	}
	

	// Todo: Deprecate
	ui.getShadowRoot = function() {
		return shadowRootNode || createShadowRoot();
	}

	function addToShadowRoot(html, returnNode) {
		shadowRootNode.querySelector('div').insertAdjacentHTML('beforeend', html);

		if(returnNode) {
			return shadowRootNode.querySelector('div').querySelector(returnNode);
		}
	}

	function createShadowRoot() {
		document.body.insertAdjacentHTML('beforeend', '<div id="terafm-shadow"></div>');

		shadowRootNode = document.getElementById('terafm-shadow').attachShadow({mode: 'open'});
		shadowRootNode.innerHTML = '<div>';
		shadowRootNode.querySelector('div').insertAdjacentHTML('beforeend', '<style> @import "' + chrome.runtime.getURL('css/contentShadowRoot.css') + '"; </style>');

		return shadowRootNode;
	}
})(terafm.ui);