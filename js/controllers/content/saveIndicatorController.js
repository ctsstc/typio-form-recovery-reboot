window.terafm = window.terafm || {};

(function(options, saveIndicator, editableManager, Events, initHandler) {

	initHandler.onInit(function() {
		let isEnabled = options.get('saveIndicator') !== 'disable';

		if(isEnabled) {
			addEventListeners();
		}
	});


	function addEventListeners() {

		Events.on('db-save', () => {
			saveIndicator.animate();
		});

		Events.on('editable-text-focus', function() {
			saveIndicator.build(function() {

				if(!terafm.validator.validate(terafm.focusedEditable)) {
					return false;
				}

				saveIndicator.show()
				saveIndicator.animate();
			});
		});

		Events.on('blur', function() {
			saveIndicator.build(function() {
				saveIndicator.hide()
			});
		});
	}

})(terafm.options, terafm.saveIndicator, terafm.editableManager, terafm.Events, terafm.initHandler);