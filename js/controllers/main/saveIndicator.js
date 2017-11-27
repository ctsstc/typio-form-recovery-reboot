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

				let editable = editableManager.getEditable(e.path[0]);

				if(!editable) return true;

				// console.log('focus: show indicator')
				saveIndicator.show()
			});
		});

		DOMEvents.registerHandler('blur', function() {
			saveIndicator.build(function() {
				// console.log('blur: hide indicator')
				saveIndicator.hide()
			});
		});



		DOMEvents.registerHandler('input', function(e) {
			let editable = editableManager.getEditable(e.path[0]);

			if(!editable) return true;

			saveIndicator.build(function() {
				// console.log('input: show pulse')
				saveIndicator.show();
				saveIndicator.pulse();
			});
		});

		DOMEvents.registerHandler('change', function(e) {
			let editable = editableManager.getEditable(e.path[0]);

			if(!editable) return true;

			saveIndicator.build(function() {
				// console.log('change: show pulse')
				saveIndicator.show();
				saveIndicator.pulse();
			});
		});


	}

})(terafm.options, terafm.saveIndicator, terafm.editableManager, terafm.DOMEvents, terafm.initHandler);