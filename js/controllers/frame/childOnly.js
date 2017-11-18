(function() {
	'use strict';


	// Run only in child frames
	if(window !== window.top) {


		window.terafm = window.terafm || {};

		window.top.postMessage({
			action: 'terafmRequestOptions'
		}, '*');

		window.top.addEventListener('message', function(msg) {
			if(msg.data.action && msg.data.action === 'terafmReturnOptions') {
				// console.log(msg.data.data)

				if(!terafm.options) {
					// Option module shim
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
			// console.log('broadcasting message');
			// var editable = terafm.editableManager.getEditable(e.target);
			var editable = terafm.editableManager.getEditable(e.path[0]);

			if(editable !== false) {
				var path = terafm.editableManager.genPath(editable);
				window.top.postMessage({
					action: 'terafmSetContextTarget',
					data: path
				}, '*');
				// Todo: Send message
				// terafm.context.iframeSetContextTarget(editable, window.frameElement);
				// console.log('setting target', editable);
			}
		});





		// Click anywhere in iframe to close dialog
		// document.addEventListener('click', function() {
		// 	terafm.context.close();
		// });



		// For saving
		document.addEventListener('change', documentChangeHandler);
		document.addEventListener('keyup', documentChangeHandler);

		function documentChangeHandler(e) {

			// var editable = terafm.editableManager.getEditable(e.target);
			var editable = terafm.editableManager.getEditable(e.path[0]);

			if(editable) {
				var edValue = terafm.editableManager.getEditableValue(editable),
					edPath = terafm.editableManager.genPath(editable);
					//edId = terafm.editableManager.generateEditableId(edPath); // Can do later if need

				if(!edPath) {
					if(editable.dataset.terafmGlobId) {
						edPath = editable.dataset.terafmGlobId;
					} else {
						editable.dataset.terafmGlobId = 'global:' + Math.round(Math.random()*10000000);
						edPath = editable.dataset.terafmGlobId;
					}
					console.log('Could not generate input path, will save as:', edPath)
				}

				// console.log('generated', edPath);
				// console.log('found', $(edPath));

				window.top.postMessage({
					action: 'terafmSave',
					data: {
						value: edValue,
						path: edPath,
						//id: 1234, // New! Cannot depend on yet though
						//frame: ''// Deprecated
					}
				}, '*');
				// terafm.editableManager.saveEditable(editable, value);
			}

		}

	}

})();