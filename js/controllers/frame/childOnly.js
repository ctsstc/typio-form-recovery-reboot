(function() {
	'use strict';

	// Used for communication between top/child page scripts
	function requestAction(action, data) {
		var reqObj = {};
		reqObj.action = action;
		if(data) reqObj.data = data;
		window.top.postMessage(reqObj, '*');
	}


	// Run only in child frames
	if(window !== window.top) {
		window.terafm = window.terafm || {};


		// Request options
		requestAction('terafmRequestOptions');

		// Listen for option response
		window.top.addEventListener('message', function(msg) {
			if(msg.data.action && msg.data.action === 'terafmReturnOptions') {
				if(!terafm.options) {

					// Option module shim (used by editableManager)
					window.terafm.options = {
						opts: msg.data.data,
						get: function(opt) {
							return this.opts[opt];
						}
					}
				}
			}
		});


		// Set rightclick target in context controller
		document.addEventListener('contextmenu', function(e) {
			var editable = terafm.editableManager.getEditable(e.path[0]);

			if(editable !== false) {
				var data = {
					path: terafm.editableManager.genPath(editable),
					pos: { x: e.pageX, y: e.pageY }
				};
				requestAction('terafmSetContextTarget', data);
			}
		});



		// Click anywhere in iframe to close dialog
		document.addEventListener('mousedown', () => requestAction('terafmHideContextMenu'));
		document.addEventListener('focus', () => requestAction('terafmHideContextMenu'));



		// Editable change events
		document.addEventListener('change', changeHandler);
		document.addEventListener('keyup', changeHandler);

		function changeHandler(e) {

			var editable = terafm.editableManager.getEditable(e.path[0]);

			if(editable) {
				let entryObj = terafm.editableManager.createEntryObject(editable, editable.value),
					edId = terafm.editableManager.generateEditableId(editable);

				var data = {
					editableId: edId,
					data: entryObj
				};
				requestAction('terafmSave', data)
			}

		}

	}


})();