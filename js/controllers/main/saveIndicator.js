window.terafm = window.terafm || {};

(function(options, saveIndicator, editableManager) {

	terafm.init(function() {
		let isEnabled = options.get('saveIndicator') !== 'disable';

		if(isEnabled) {
			addEventListeners();
		}

	});


	function addEventListeners() {

		terafm.registerHandler('focus', function(e) {
			saveIndicator.build(function() {

				let editable = editableManager.getEditable(e.path[0]);

				if(!editable) return true;

				// console.log('focus: show indicator')
				saveIndicator.show()
			});
		});

		terafm.registerHandler('blur', function() {
			saveIndicator.build(function() {
				// console.log('blur: hide indicator')
				saveIndicator.hide()
			});
		});



		terafm.registerHandler('keyup', function(e) {
			let editable = editableManager.getEditable(e.path[0]);

			if(!editable) return true;

			saveIndicator.build(function() {
				// console.log('keyup: show pulse')
				saveIndicator.show();
				saveIndicator.pulse();
			});
		});

		terafm.registerHandler('change', function(e) {
			let editable = editableManager.getEditable(e.path[0]);

			if(!editable) return true;

			saveIndicator.build(function() {
				// console.log('change: show pulse')
				saveIndicator.show();
				saveIndicator.pulse();
			});
		});


	}

})(terafm.options, terafm.saveIndicator, terafm.editableManager);