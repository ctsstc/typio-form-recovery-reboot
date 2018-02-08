
var keyInpts = document.querySelectorAll('.set-shortcut')
for(input of keyInpts) {
	captureKeysForInput(input)
}

function captureKeysForInput(input) {
	let shortcut = []


	input.addEventListener('keydown', function(e) {

		if(shortcut.indexOf(e.key) === -1) {
			shortcut.push(e.key);

			input.value = shortcut.join(' + ');
		}

		e.preventDefault();
		e.stopPropagation()
	}, true);

	input.addEventListener('keyup', function(e) {

		shortcut = []
		
		// for (var i in shortcut) {
		// 	if(shortcut[i] === e.key) {
		// 		shortcut = shortcut.splice(i, 0)
		// 	}
		// }

		input.blur()
	}, true);

}





// Handle blacklist module
(function(blacklist) {

	let listContainerNode = document.querySelector('#domainBlacklist'),
		addForm = document.querySelector('#blacklist-add-form'),
		errorMsgNode = document.querySelector('.blacklist-module .error'),

		domainList = [];

	// Populate domain list
	blacklist.getAll(function(list) {
		domainList = list;
		let html = '';

		for(id in list) {
			html += genListItem(id, list[id]);
		}

		listContainerNode.innerHTML = html;
	})

	// Add to blacklist
	addForm.addEventListener('submit', function(e) {
		e.preventDefault();

		let domain = sanitizeHostname(new FormData(addForm).get('domain'));

		if(!domain) {
			errorMsgNode.classList.remove('hidden');
			return false;
		} else {
			errorMsgNode.classList.add('hidden');
		}

		let id = domainList.push(domain) -1,
			html = genListItem(id, domain, 'new-style');

		removeAnimationStyling();

		listContainerNode.innerHTML += html;
		listContainerNode.scrollTop = listContainerNode.scrollHeight;
		blacklist.block(domain);

		addForm.querySelector('input').value = '';
	})

	// Delete from blacklist
	listContainerNode.addEventListener('click', function(e) {
		if(e.target.classList.contains('del')) {
			let li = e.target.closest('li'),
				id = li.dataset.id;

			// Use callback to make sure its actually deleted
			// before deleting list node. If storage operation
			// limit exceeds it can fail. Limit is 120 ops per minute.
			blacklist.unblock(domainList[id], function() {
				// Do NOT splice it out of the array, it will
				// shift the indexes and you'll end up deleting
				// the wrong domains. Delete will leave the index
				// as undefined but that's fine.
				delete domainList[id];

				li.parentNode.removeChild(li);
			});
		}
	})


	// Todo: sanitize
	function genListItem(id, domain, classname) {
		return '<li class="'+ classname +'" data-id="'+ id +'"><span>' + domain + '</span><span class="del">Delete</span></li>';
	}

	function removeAnimationStyling() {
		let newItems = listContainerNode.querySelectorAll('.new-style');

		for(item of newItems) {
			item.classList.remove('new-style');
		}
	}

	function sanitizeHostname(domain, isSecondTry) {
		domain = domain.trim();

		try {
			domain = new URL(domain);

			if(domain.hostname.indexOf('%20') !== -1) {
				return false;
			}
			return domain.hostname;

		} catch(e) {

			// If first try and no http in string, prepend http and try again
			if(!isSecondTry && domain.indexOf('http') !== 0) {
				return sanitizeHostname('http://' + domain, true)

			} else {
				return false;
			}
		}
	}
})(terafm.blacklist);




// Autosave ell inputs with the class autosave on change
// Will also restore values on load
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

				// If we have a stored value of this option, update form elem
				if((stored[optionName] !== undefined)) {

					// Checkboxes
					if(opt.type === 'checkbox') {
						opt.checked = stored[optionName];

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