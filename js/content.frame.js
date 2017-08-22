(function() {

	// Only run in frames
	if(window.top !== window) {

		try {
			var terafm = window.top.terafm;
		} catch(e) {
			return false;
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



		// For saving
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