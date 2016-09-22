
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

				// Skip if invalid stored value
				if(stored[optionName] == 'undefined') {
					continue;
				}

				// Check if we have a stored value of this option,
				// and if so, update form elem
				if(stored[optionName] !== 'undefined') {
					if(opt.type === 'checkbox') {
						opt.checked = stored[optionName];
					} else {
						opt.value = stored[optionName];
					}
				}

				// Change listener which updates stored value
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
	closeBtn.onclick = function() {
		window.close();
	}

})();