window.terafm = window.terafm || {};

(function(options, saveIndicator, editableManager, DOMEvents, initHandler) {

	initHandler.onInit(function() {
		let isEnabled = options.get('saveIndicator') !== 'disable';

		if(isEnabled) {

			addEventListeners();
		}
	});


	function addEventListeners() {
		DOMEvents.registerHandler('focus', function(e) {
			saveIndicator.build(function() {

				let isEditable = editableManager.isEditableText(e.path[0]) && editableManager.checkRules(e.path[0]);

				if(!isEditable) {
					return false;
				}

				saveIndicator.show()
				saveIndicator.animate();
			});
		});

		DOMEvents.registerHandler('blur', function() {
			saveIndicator.build(function() {
				saveIndicator.hide()
			});
		});
	}

})(terafm.options, terafm.saveIndicator, terafm.editableManager, terafm.DOMEvents, terafm.initHandler);