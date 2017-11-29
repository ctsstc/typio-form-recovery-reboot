window.terafm = window.terafm || {};
terafm.ui = {};

(function(ui) {
	'use strict';

	var shadowRootNode;

	ui.inject = function(dataObj, replaceObj, callback) {

		// Make sure shadow root has been created
		if(!shadowRootNode) {
			createShadowRoot();
		}

		// Make replace arg optional
		if(!callback) {
			callback = replaceObj;
			replaceObj = undefined;
		}

		// If template was passed, fetch template content
		if(dataObj.path) {

			// Complete path will full extenison url
			dataObj.path = chrome.runtime.getURL(dataObj.path);

			var request = fetch(dataObj.path).then(response => response.text());

			request.then(function(text) {
				if(replaceObj) text = replacePlaceholders(text, replaceObj);
				let retnode = addToShadowRoot(text, dataObj.returnNode);
				callback(retnode);
			});

		// Html was passed, insert
		} else if(dataObj.html) {
			if(replaceObj) dataObj.html = replacePlaceholders(dataObj.html, replaceObj);
			let retnode = addToShadowRoot(dataObj.html, dataObj.returnNode);
			callback(retnode);
		}

	}

	function replacePlaceholders(htmlStr, replObj) {
		Object.keys(replObj).map((key) => {
			htmlStr = htmlStr.replace(key, replObj[key]);
		})
		return htmlStr;
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