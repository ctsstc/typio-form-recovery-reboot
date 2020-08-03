import blacklist from '../../modules/blacklist'
import defaultOptions from '../../modules/options/defaultOptions'

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
	for(const input of keyInpts) {
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
(function() {

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

		for(const item of newItems) {
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
})();




// Autosave ell inputs with the class autosave on change
// Will also restore values on load
;(function() {

	var options = document.getElementsByClassName('autosave'),
		defaults = defaultOptions.getAll();

	// Set default options first
	(function() {
		for(var def in defaults) {
			var el = document.querySelector('[data-option="'+ def +'"]')
			if(el) {
				setOption(el, defaults[def]);

				// Set default value as data prop for key bindings (to be able to reset)
				if(def.indexOf('keybind') !== -1) 	{
					el.defaultValue = defaults[def]
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