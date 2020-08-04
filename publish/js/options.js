window.terafm = window.terafm || {};
terafm.blacklist = {};

(function(blacklist) {

	blacklist.getAll = function(callback) {
		getOptionData(callback)
	}

	blacklist.blockDomain = function(domain) {
		getOptionData(function(list) {
			if(isBlocked(list, domain) === false) {
				list.push(domain);
				saveList(list);
			}
		});
	}

	blacklist.unblock = function(url, callback) {
		getOptionData(function(list) {
			let index = isBlocked(list, url);
			if(index !== false) {
				list.splice(index, 1);
				saveList(list, callback);
			}
		});
	}

	blacklist.isBlocked = function(url, callback) {
		getOptionData(function(list) {
			callback(isBlocked(list, url) !== false );
		});
	}

	function isBlocked(list, url) {

		let index = list.indexOf(url);
		if(index !== -1) return index;

		try {
			// Full URL was passed
			let urlObj = new URL(url);

			// Check if hostname is blocked
			let index = list.indexOf(urlObj.hostname);
			if(index !== -1) return index;


			// Loop through items and compare individually
			for(let pi in list) {
				let pattern = list[pi];

				// Regex
				let regex = isRegex(pattern);
				if(regex !== false) {
					if(regex.test(url)) {
						return pi;
					}

					// Wildcard
				} else if(pattern.indexOf('*') !== -1) {
					let wild = wildcardCheck(pattern, urlObj.hostname);
					if(wild) return pi;
				}
			}

			// Domain was passed instead of URL
		} catch(e) {

			let domain = url;

			console.log(domain);

			let index = list.indexOf(domain);
			if(index !== -1) return index;

			for(let pi in list) {
				// Wildcard
				if(list[pi].indexOf('*') !== -1) {
					let wild = wildcardCheck(list[pi], domain);
					if(wild) return pi;
				}
			}
		}


		function wildcardCheck(pattern, hostname) {
			try {
				let regex = new RegExp( pattern.replace('.', '\.?').replace('*', '.*?') );
				if(regex.test(hostname)) {
					return true;
				}
			} catch(e){}
		}


		return false;
	}

	function isRegex(string) {
		if(string.length > 3 && string.indexOf('/') === 0 && string.slice(-1) === '/') {
			let tmp = string.substring(1, string.length-1);
			try {
				return new RegExp(tmp);
			} catch(e) {}
		}
		return false;
	}

	function saveList(list, callback) {
		chrome.storage.sync.set({'domainBlacklist': list}, function(set) {
			if(callback) callback();
		});
	}


	function getOptionData(callback) {
		chrome.storage.sync.get('domainBlacklist', function(data) {
			data = convertLegacy(data['domainBlacklist']);
			callback(data);
		})
	}


	// Old blacklist was saved as a big text field with one domain per line
	// If the old format is still used, this function converts the data
	// into array format.
	function convertLegacy(blob) {

		// Empty array or string or null
		if(!blob) {
			return [];

			// If string, convert to array
		} else if(typeof blob === 'string') {
			blob = (blob + "").split(/[\r|\n]+/g).filter(word => word.trim().length > 0);
			return blob;

			// Already array
		} else {
			return blob;
		}
	}

})(terafm.blacklist);
window.terafm = window.terafm || {};
window.terafm.optionSanitizer = {};

(function(optionSanitizer) {
	'use strict';

	var sanitizers = {

		// Generic, can be reused
		bool: function(bool) {
			return bool == true ? true : false;
		},
		hexColor: function(value) {
			return /^(#[0-9a-f]{6}|[0-9a-f]{3})$/i.test(value) ? value : undefined;
		},
		yearInDays: function(days) {
			days = parseInt(days);
			return	(days > 0 && days < 366) ? days :
					(days > 365) ? 365 : 
					(days < 1) ? 1 :
					undefined;
		},

		// Specific ones
		keyBinding: function(value) {
			return value.replace(/\s/g, '').split('+');
			// return value.replace(/[^a-z+]/gi, '').split('+');
		},
		saveIndicator: function(value) {
			return ['topline', 'cornertriag', 'disable'].includes(value) ? value : undefined;
		},
		quickAccessTrigger: function(value) {
			return ['focus', 'doubleclick'].includes(value) ? value : undefined;
		}
	};


	var pointers = {
		savePasswords: sanitizers.bool,
		saveCreditCards: sanitizers.bool,
		hideSmallEntries: sanitizers.bool,
		saveIndicatorColor: sanitizers.hexColor,
		storageTimeDays: sanitizers.yearInDays,
		quickAccessButtonEnabled: sanitizers.bool,
		quickAccessButtonTrigger: sanitizers.quickAccessTrigger,
		cloneOnRestore: sanitizers.bool,
		resetEditablesBetweenRestorations: sanitizers.bool,
		qaGroupSessions: sanitizers.bool,
		qaEnableSessionSubmenu: sanitizers.bool,

		keybindToggleRecDiag: sanitizers.keyBinding,
		keybindRestorePreviousSession: sanitizers.keyBinding,
		keybindOpenQuickAccess: sanitizers.keyBinding,
		keybindEnabled: sanitizers.bool
	}

	optionSanitizer.sanitize = function(name, value) {

		if(typeof name === 'object') {
			value = name;
			for(name in value) {
				value[name] = optionSanitizer.sanitize(name, value[name])
			}
			return value

		} else {
			
			// Sanitazer found (generic)
			if(name in pointers) {
				return pointers[name](value)

			// Custom sanitizer found (specific)
			} else if(name in sanitizers) {
				return sanitizers[name](value)

			// No sanitizer found, fail
			} else {
				return undefined;
			}

		}
	}

})(terafm.optionSanitizer);
window.terafm = window.terafm || {};
window.terafm.defaultOptions = {};

// Default options as stored in database. Needs to be sanitized (keybindigs especially).
(function(defaultOptions, help) {
	'use strict';

	var def = {}
	
	def.savePasswords = false;
	def.saveCreditCards = false;
	def.storageTimeDays = 7;
	def.saveIndicator = 'disable';
	def.saveIndicatorColor = '#3CB720';
	def.hideSmallEntries = true;
	def.keybindEnabled = true;
	def.quickAccessButtonEnabled = true;
	def.quickAccessButtonTrigger = 'focus';
	def.cloneOnRestore = false;
	def.resetEditablesBetweenRestorations = false;
	def.qaGroupSessions = true;
	def.qaEnableSessionSubmenu = true;

	// Mac specific
	if(window.navigator.platform.toLowerCase().indexOf('mac') !== -1) {
		def.keybindToggleRecDiag = 'Control + Backspace';
		def.keybindRestorePreviousSession = 'Control + Alt + Backspace';
		def.keybindOpenQuickAccess = 'Control + r';

	// Windows and everything else
	} else {
		def.keybindToggleRecDiag = 'Alt + Backspace';
		def.keybindRestorePreviousSession = 'Shift + Alt + Backspace';
		def.keybindOpenQuickAccess = 'Alt + r';
	}
	



	defaultOptions.get = function(opt) {
		return opt in def ? def[opt] : undefined
	}

	defaultOptions.getAll = function() {
		return def
	}


})(terafm.defaultOptions, terafm.helpers);

(function() {

	let node,
		visible = false;

	document.addEventListener('mousemove', function(e) {
		if(e.path[0].dataset.tooltip) {
			let text = e.path[0].dataset.tooltip;

			build();

			node.innerText = text;
			node.style.display = 'block';
			node.style.top = window.scrollY + e.clientY + 20 + 'px';
			node.style.left = window.scrollX + e.clientX + 'px';

			visible = true;
		} else if(visible) {
			node.style.display = 'none';
			visible = false;
		}
	})

	function build() {
		if(node) return node;
		document.body.insertAdjacentHTML('beforeend', '<div id="terafm-tooltip"></div>');
		node = document.querySelector('#terafm-tooltip');
	}

})();



function keyCapture() {
	var keyInpts = document.querySelectorAll('.set-shortcut'),
		currInput = undefined,

		changeMsg = document.querySelector('.key-combo-module .change-msg'),

		captureOverlay = document.querySelector('#key-combo-capturer'),
		capturePlaceholder = captureOverlay.querySelector('.placeholder'),


		cancelBtn = captureOverlay.querySelector('[data-trigger-cancel]'),
		disableBtn = captureOverlay.querySelector('[data-trigger-disable]'),
		setDefaultBtn = captureOverlay.querySelector('[data-trigger-default]');

	// Attach function to inputs
	for(input of keyInpts) {
		attachTo(input)
	}

	cancelBtn.addEventListener('click', function() {
		closeCapture()
	})

	disableBtn.addEventListener('click', function() {
		currInput.value = '';
		saveInput()
		closeCapture()
		showChangeMsg()
	});

	setDefaultBtn.addEventListener('click', function() {
		currInput.value = currInput.defaultValue;
		saveInput()
		closeCapture()
		showChangeMsg()
	});

	function showChangeMsg() {
		changeMsg.classList.remove('hidden')
	}

	function saveInput() {
		var evt = new Event('change')
		currInput.dispatchEvent(evt)
	}

	function closeCapture() {
		captureOverlay.classList.add('hidden')
		currInput.blur()
		currInput.classList.remove('okAnim')
		setTimeout(function() {
			currInput.classList.add('okAnim')
		}, 100)
	}

	for(input of keyInpts) {
		attachTo(input)
	}

	function attachTo(input) {
		let shortcut = []

		input.addEventListener('focus', function() {
			currInput = input;
			capturePlaceholder.innerHTML = 'Enter keyboard combination'
			captureOverlay.classList.remove('hidden')
			capturePlaceholder.classList.remove('accent')
		})


		input.addEventListener('keydown', function(e) {
			if(e.key === 'Escape') {
				closeCapture();
				input.blur();
				return false;
			}

			if(shortcut.indexOf(e.key) === -1) {
				shortcut.push(e.key);
				var txt = shortcut.join(' + ')

				input.value = txt;
				capturePlaceholder.innerHTML = txt;
				capturePlaceholder.classList.add('accent')
			}

			e.preventDefault();
			e.stopPropagation()
		}, true);

		input.addEventListener('keyup', function(e) {
			shortcut = []
			input.blur()
			closeCapture();
			showChangeMsg()
		}, true);

	}

}

keyCapture();



(function() {

	var saveOptsGrp = document.querySelector('#save-restore-group');

	saveOptsGrp.addEventListener('change', function(e) {

		if(e.target.type === 'checkbox' && e.target.checked !== true) {
			saveOptsGrp.querySelector('.note').classList.remove('hidden')
		}
	});
})();


// Handle blacklist module
(function(blacklist) {

	let listContainerNode = document.querySelector('#domainBlacklist'),
		addForm = document.querySelector('#blacklist-add-form'),

		blocks = [];

	// Populate domain list
	blacklist.getAll(function(list) {
		blocks = list;
		let html = '';

		for(id in list) {
			html += genListItem(id, list[id]);
		}

		listContainerNode.innerHTML = html;
	})

	// Add to blacklist
	addForm.addEventListener('submit', function(e) {
		e.preventDefault();

		let url = new FormData(addForm).get('domain').trim();

		if(url.length < 3) return false;

		// contains http/s and not regex
		if(url.match(/^https?:\/\//) !== null && (url.charAt(0) === '/' && url.charAt(url.length-1) === '/') === false) {
			try {
				url = new URL(url).hostname;
			} catch(e) {
				return false;
			}
		} else {
			url = url.toLowerCase();
		}

		let id = blocks.push(url) -1,
			html = genListItem(id, url, 'new-style');

		removeAnimationStyling();

		listContainerNode.innerHTML += html;
		listContainerNode.scrollTop = listContainerNode.scrollHeight;
		blacklist.blockDomain(url);

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
			blacklist.unblock(blocks[id], function() {
				// Do NOT splice it out of the array, it will
				// shift the indexes and you'll end up deleting
				// the wrong domains. Delete will leave the index
				// as undefined but that's fine.
				delete blocks[id];

				li.parentNode.removeChild(li);
			});
		}
	})


	function genListItem(id, domain, classname) {
		return '<li class="'+ classname +'" data-id="'+ id +'"><span>' + domain + '</span><span class="del">Delete</span></li>';
	}

	function removeAnimationStyling() {
		let newItems = listContainerNode.querySelectorAll('.new-style');

		for(item of newItems) {
			item.classList.remove('new-style');
		}
	}

	function isRegex(string) {
		if(string.length > 3 && string.indexOf('/') === 0 && string.slice(-1) === '/') {
			let tmp = string.substring(1, string.length-1);
			try {
				return new RegExp(tmp);
			} catch(e) {}
		}
		return false;
	}
})(terafm.blacklist);




// Autosave ell inputs with the class autosave on change
// Will also restore values on load
;(function() {

	var options = document.getElementsByClassName('autosave'),
		defaultOptions = terafm.defaultOptions.getAll();

	// Set default options first
	(function() {
		for(var def in defaultOptions) {
			var el = document.querySelector('[data-option="'+ def +'"]')
			if(el) {
				setOption(el, defaultOptions[def]);

				// Set default value as data prop for key bindings (to be able to reset)
				if(def.indexOf('keybind') !== -1) 	{
					el.defaultValue = defaultOptions[def]
				}
			}
		}
	})();


	// Loop through saved options and override defaults
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

					var san = undefined;

					if(opt.dataset.option === 'storageTimeDays') {
						var days = parseInt(stored[optionName]),
							san =	(days > 0 && days < 366) ? days :
								(days > 365) ? 365 :
									(days < 1) ? 1 :
										7;

						opt.value = san;
					}

					setOption(opt, san === undefined ? stored[optionName] : san)
				}

				// Set event listener which updates stored value
				opt.onchange = saveOption;
				opt.onkeyup = saveOption;
			}

		});
	}

	function setOption(elem, value) {
		if(elem.type === 'checkbox') {
			elem.checked = value
		} else {
			elem.value = value
		}
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

})();