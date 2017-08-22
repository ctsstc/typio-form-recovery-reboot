(function() {

	// Only run in frames
	if(window.top !== window) {

		var returnMouseoverCallback;

		document.addEventListener('mouseover', function(e) {

			if(returnMouseoverCallback) {

				if(window.top.terafm.editableManager.isEditable(e.toElement)) {
				
					returnMouseoverCallback(e);
				}
			}
		});

		window.terafmGetMouseover = function(callback) {
			returnMouseoverCallback = callback;
		}




		document.addEventListener('contextmenu', function(e) {
			var editable = window.top.terafm.editableManager.getEditable(e.target);

			if(editable !== false) {
				window.top.terafm.context.iframeSetContextTarget(editable, window.frameElement);
			}
		});





		document.addEventListener('click', function() {
			window.top.terafm.context.close();
		});



	}

})();