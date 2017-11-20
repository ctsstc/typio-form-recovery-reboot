window.terafm = window.terafm || {};

(function(options, saveIndicator, editableManager) {

	terafm.init(function() {
		let isEnabled = options.get('saveIndicator') !== 'disable';

		if(isEnabled) {
			addEventListeners();
		}

	});


	function addEventListeners() {

		document.addEventListener('focus', function(e){
			saveIndicator.build(function() {

				let editable = editableManager.getEditable(e.path[0]);

				if(!editable) return true;

				saveIndicator.show()
			});
		}, true);

		document.addEventListener('blur', function(){
			saveIndicator.build(function() {
				saveIndicator.hide()
			});
		}, true);

		document.addEventListener('keyup', function(e){

			let editable = editableManager.getEditable(e.path[0]);

			if(!editable) return true;

			saveIndicator.build(function() {
				saveIndicator.show();
				saveIndicator.pulse();
			});
		});

		// Todo: Do i need?
		document.addEventListener('change', function(e){

			let editable = editableManager.getEditable(e.path[0]);

			if(!editable) return true;

			saveIndicator.build(function() {
				saveIndicator.show();
				saveIndicator.pulse();
			});
		});

	}

})(terafm.options, terafm.saveIndicator, terafm.editableManager);