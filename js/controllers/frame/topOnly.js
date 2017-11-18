(function() {
	'use strict';

	// Run once in top window
	if(window === window.top) {
		// chrome.runtime.sendMessage('kacepnhocenciegcjpebnkmdbkihmnlb', 'from top');


		// Listens for save req from child iframe injections
		window.top.addEventListener('message', function(msg) {
			if(msg.data.action && msg.data.action === 'terafmSave') {
				// Save
				/*terafm.db.init(function() {
					console.log('ready to save', msg.data.data, terafm);

					var data = msg.data.data;

					var edId = terafm.editableManager.generateEditableId(data.path)


					// Min length of string to save
					// Don't bother removing HTML here, it's too expensive
					if(data.value.length < 1) {
						terafm.db.deleteSingleRevisionByEditable(edId);
						return false;
					}

					// Special care for radio inputs, have to delete siblings
					// if(editable.type === 'radio') {
					// 	deleteRadioSiblingsFromStorage(editable, framePath);
					// }

					var data = {
						value: data.value,
						path: data.path
					}

					// console.log('saving', edId, data);
					// terafm.toast.create('Saved entry');

					terafm.db.saveRevision(edId, data);
				});*/
			} else if(msg.data.action && msg.data.action === 'terafmRequestOptions') {

				window.top.postMessage({
					action: 'terafmReturnOptions',
					data: terafm.options.getAll()
				}, '*');
			}
		})

	}

})();