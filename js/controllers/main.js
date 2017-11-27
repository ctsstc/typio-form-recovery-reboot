var terafm = window.terafm;

(function(db, options, saveIndicator, dialog) {
	'use strict';

	// Testing
	/*
			setTimeout(function() {
				console.log('---------------------');
				var t = document.querySelector('#shadow').shadowRoot.querySelector('div').shadowRoot.querySelector('iframe').contentWindow.document.querySelector('.sec').shadowRoot.querySelector('input');
				var path = terafm.editableManager.genPath(t);

				console.log('generated:', path);
				var found = $(path);
				console.log('found:', found);
				return;
				
			}, 500);

			// if(window.location.host === 's.codepen.io' && window.top === window) {
			// 	setTimeout(function() {
			// 		terafm.dialog.open();
			// 	}, 300); 
			// }
	*/

	// Todo: Make sure db is available when other modules load

	// Initiate DB, populate in-memory storage
	db.init(function() {

		// // Load extension options into memory
		options.loadFromChromeStorage(function() {

			executeInitHandlers();
		});

	});


	// document.addEventListener('input', function(e) {
	// 	console.log('input for', e.path[0], e);
	// })





	let handlers = {};
	terafm.triggerEvent = function(type, event) {
		let c = 0;
		if(type in handlers) {
			for(let h =0; h < handlers[type].length; ++h) {
				handlers[type][h](event);
				c++;
			}
		}
		// console.log(type, c + ' handlers', event);
	}

	terafm.registerHandler = function(type, callback) {
		if(!Array.isArray(handlers[type])) handlers[type] = [];

		handlers[type].push(callback);
	}


	document.addEventListener('click', (e) => 		terafm.triggerEvent(e.type, e) );
	document.addEventListener('mousedown', (e) => 	terafm.triggerEvent(e.type, e) );
	document.addEventListener('focus', (e) =>		terafm.triggerEvent(e.type, e) , true);
	document.addEventListener('blur', (e) =>		terafm.triggerEvent(e.type, e) , true);
	document.addEventListener('keyup', (e) => 		terafm.triggerEvent(e.type, e) );
	document.addEventListener('contextmenu', (e) => terafm.triggerEvent(e.type, e) );
	document.addEventListener('change', (e) => 		terafm.triggerEvent(e.type, e) , true);





	var initHandlers = [];
	terafm.init = function(callback) {
		initHandlers.push(callback);
	}

	function executeInitHandlers() {
		initHandlers.forEach(function(func) {
			func();
		});
	}



	// Used to check if script is already injected. Message is sent from background.js
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

		// Used to check if content scripts are already injected
		if(request.action === 'ping') {
			sendResponse(true);
		
		} else if(request.action === 'clearData') {
			db.deleteAllSessions();
			dialog.close();
		}
	});

})(terafm.db, terafm.options, terafm.saveIndicator, terafm.dialog);