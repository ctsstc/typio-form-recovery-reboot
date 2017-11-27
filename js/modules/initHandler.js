window.terafm = window.terafm || {};
terafm.initHandler = {};

(function(initHandler) {
	'use strict';

	let initHandlers = [],
		isInitiated = false;


	initHandler.onInit = function(callback) {
		if (isInitiated) callback();
		else initHandlers.push(callback);
	}

	initHandler.executeInitHandlers = function() {
		isInitiated = true;
		initHandlers.forEach(function(func) {
			func();
		});
	}

})(terafm.initHandler);