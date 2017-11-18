window.terafm = window.terafm || {};
terafm.ui = (function() {
	'use strict';

	var shadowRootNode;

	function createShadowRoot() {
		document.body.insertAdjacentHTML('beforeend', '<div id="terafm-shadow"></div>');

		shadowRootNode = document.getElementById('terafm-shadow').attachShadow({mode: 'open'});
		shadowRootNode.innerHTML = '<div>';
		shadowRootNode.querySelector('div').insertAdjacentHTML('beforeend', '<style> @import "' + chrome.runtime.getURL('css/contentShadowRoot.css') + '"; </style>');

		return shadowRootNode;
	}
	

	var exp = {};

	exp.getShadowRoot = function() {
		return shadowRootNode || createShadowRoot();
	}
	return exp;
})();