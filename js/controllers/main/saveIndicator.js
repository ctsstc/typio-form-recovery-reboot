window.terafm = window.terafm || {};

(function(options, saveIndicator, editableManager, DOMEvents, initHandler) {

	initHandler.onInit(function() {
		let isEnabled = options.get('saveIndicator') !== 'disable';

		if(isEnabled) {
			addEventListeners();
		}
	});


	function addEventListeners() {
		
		// Check if an input is autofocused
		if(editableManager.isEditableText(document.activeElement)) {
			saveIndicator.build(function() {
				saveIndicator.show();
			});
		}

		DOMEvents.registerHandler('focus', function(e) {
			saveIndicator.build(function() {

				let isEditable = editableManager.isEditableText(e.path[0]);

				if(!isEditable) return true;

				// console.log('focus: show indicator')
				saveIndicator.show()
				saveIndicator.animate();
			});
		});

		DOMEvents.registerHandler('blur', function() {
			saveIndicator.build(function() {
				// console.log('blur: hide indicator')
				saveIndicator.hide()
			});
		});



		DOMEvents.registerHandler('input', function(e) {
			let isEditable = editableManager.isEditableText(e.path[0]);

			if(!isEditable) return true;

			saveIndicator.build(function() {
				// console.log('input: show pulse')
				saveIndicator.show();
				saveIndicator.pulse();
			});
		});


	}

})(terafm.options, terafm.saveIndicator, terafm.editableManager, terafm.DOMEvents, terafm.initHandler);