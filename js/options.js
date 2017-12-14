;(function() {

	var options = document.getElementsByClassName('autosave');

	if(options.length) {

		// Get all currently stored
		chrome.storage.sync.get(null, function(stored) {

			// Loop through all options found on page
			for(var optI=0; optI < options.length; ++optI) {
				var opt = options[optI],
					optionName = opt.getAttribute('data-option');

				// Not a setting, skip
				if(!optionName) {
					continue;
				}

				console.log(optionName, stored[optionName], opt)

				// If we have a stored value of this option, update form elem
				if((stored[optionName] !== undefined)) {

					// Checkboxes
					if(opt.type === 'checkbox') {
						opt.checked = stored[optionName];
						console.log('restoring chk', optionName, stored[optionName])

					// Sanitazion for storageTimeDays
					} else if(opt.dataset.option === 'storageTimeDays') {

						var days = parseInt(stored[optionName]),
							san =	(days > 0 && days < 366) ? days :
									(days > 365) ? 365 : 
									(days < 1) ? 1 :
									7;

						opt.value = san;

					// Any other input
					} else {
						opt.value = stored[optionName];
					}
				}

				// Set event listener which updates stored value
				opt.onchange = saveOption;
				opt.onkeyup = saveOption;
			}

		});
	}

	function saveOption() {
		var value = this.value,
			optionName = this.getAttribute('data-option'),
			data = {};

		if(this.type === 'checkbox') {
			value = this.checked;
		}

		data[optionName] = value;

		if(optionName) {
			chrome.storage.sync.set(data);
		}
	}


	var closeBtn = document.getElementById('saveAndClose');
	closeBtn.onclick = () => window.close();

})();