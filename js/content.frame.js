(function() {

	// Only run in frames
	if(window.top !== window) {

		var terafm = window.top.terafm;


		// For clicky thingy within iframes
		var returnMouseoverCallback;
		document.addEventListener('mouseover', function(e) {

			if(returnMouseoverCallback) {

				if(terafm.editableManager.isEditable(e.toElement)) {
				
					returnMouseoverCallback(e);
				}
			}
		});
		window.terafmGetMouseover = function(callback) {
			returnMouseoverCallback = callback;
		}




		// Set rightclick target in context controller
		document.addEventListener('contextmenu', function(e) {
			var editable = terafm.editableManager.getEditable(e.target);

			if(editable !== false) {
				terafm.context.iframeSetContextTarget(editable, window.frameElement);
				// console.log('setting target', editable);
			}
		});





		// Click anywhere in iframe to close dialog
		document.addEventListener('click', function() {
			terafm.context.close();
		});




		document.addEventListener('change', documentChangeHandler);
		document.addEventListener('keyup', documentChangeHandler);

		function documentChangeHandler(e) {
			var editable = terafm.editableManager.getEditable(e.target);
			if(editable) {
				var value = terafm.editableManager.getEditableValue(editable);

				terafm.editableManager.saveEditable(editable, value);
			}
		}

	}

})();