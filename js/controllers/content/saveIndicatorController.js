window.terafm = window.terafm || {};

(function(options, saveIndicator, editableManager, DOMEvents, initHandler) {

	initHandler.onInit(function() {
		let isEnabled = options.get('saveIndicator') !== 'disable';

		if(isEnabled) {
			addEventListeners();
		}
	});


	function addEventListeners() {
		DOMEvents.registerHandler('editable-text-focus', function() {
			saveIndicator.build(function() {

				if(!terafm.validator.validate(terafm.focusedEditable)) {
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