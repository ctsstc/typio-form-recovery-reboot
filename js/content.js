"use strict";

;(function() {

	document.body.insertAdjacentHTML('afterbegin', "<div id='teraUI' class='hidden'><ul class='result-list'></ul></div>");


	var tera = {};
	tera.helpers = {};

	tera.UI = document.querySelector('#teraUI');
	tera.UIResults = teraUI.querySelector('.result-list');
	tera.UIIsShowing = false;
	tera.session = Math.round(new Date().getTime()/1000);
	tera.UICurrentInput = undefined;
	tera.loadedEntries = {},
	tera.storagePrefix = 'teraField';
	tera.allowedFieldTypes = ['text', 'search', 'url', 'email', 'color', 'date', 'datetime', 'time', 'datetime-local', 'month', 'week', 'number', 'range', 'tel'];
	tera.options = {
		savePasswords: false,
		storageTimeDays: 7
	};
	tera.optionValidators = {
		savePasswords: function(bool) {
			return bool == true ? true : false;
		},
		storageTimeDays: function(days) {
			days = parseInt(days);
			return days > 0 && days < 365 ? days : tera.options.storageTimeDays;
		}
	};

	tera.init = function() {

		// Remove expired entries
		tera.cleanEntries();

		// Override default options
		chrome.storage.sync.get(null, function(options) {
			if(options) {
				for(opt in options) {
					if(opt in tera.options) {
						tera.options[opt] = tera.optionValidators[opt](options[opt]);
					}
				}
			}
		});
	}

	tera.cleanEntries = function() {
		var entries = [],
			now = tera.session;


		for (field in localStorage) {
			if(field.indexOf(tera.storagePrefix) === 0) {

				var entries = JSON.parse(localStorage[field]);

				// Field has entries
				if(Object.keys(entries).length > 0) {
					for(timestamp in entries) {
						var timeleft = (now-timestamp);

						// Too old
						if (timeleft > (tera.options.storageTimeDays*86400)) {
							delete entries[timestamp];
						}
					}

					// There are entries left, save again
					if(Object.keys(entries).length > 0) {
						entries = JSON.stringify(entries);
						localStorage.setItem(field, entries);
					
					} // All entries are gone, it's an empty object
					else {
						localStorage.removeItem(field);
					}
				}
			}
		}

	}

	tera.getInputValue = function(elem) {
		if(elem.nodeName == 'INPUT' || elem.nodeName == 'TEXTAREA') {
			return elem.value;
		}
		return elem.innerHTML;
	}

	tera.setInputValue = function(val) {
		var input = tera.UICurrentInput;
		if(input.nodeName == 'INPUT' || input.nodeName == 'TEXTAREA') {
			input.value = val;
		}
		input.innerHTML = val;
	}

	tera.setInputValueByTimestamp = function(timestamp) {
		if(!(timestamp in tera.loadedEntries)) {
			return false;
		}
		var valueObj = tera.loadedEntries[timestamp],
			input = tera.UICurrentInput;

		if(input.nodeName == 'INPUT' || input.nodeName == 'TEXTAREA') {
			input.value = valueObj.value;
		}
		input.innerHTML = valueObj.value;
	}

	// Check if element is editable
	tera.isEditable = function(elem) {

		// Check if input with valid type
		if(elem.nodeName == 'INPUT' && tera.allowedFieldTypes.includes(elem.type)) {
			return true;

		// If it's a password input, check if that's allowed
		} else if(elem.nodeName == 'INPUT' && elem.type == 'password' && tera.options.savePasswords == true) {
			return true;

		// Check if textarea
		} else if(elem.nodeName == 'TEXTAREA') {
			return true;

		// Check if contenteditable
		} else if(elem.getAttribute('contenteditable') == 'true') {
			return true;
		}

		// Nah, fuck off mate-o
		return false;
	}
	
	// Check if element is editable OR is within a contenteditable parent
	tera.getEditable = function(elem) {
		if(tera.isEditable(elem)) return elem;
		return tera.parent(elem, function(elem) { return elem.getAttribute('contenteditable') == 'true' })
	}

	tera.buildUI = function() {

		// If opened before window has finished loading
		if(!tera.UICurrentInput) {
			return false;
		}

		var input = tera.UICurrentInput,
			inPath = tera.generateDomPath(input),
			inHashPath = tera.helpers.hashCode(inPath),
			entries = tera.getEntriesByPath(inPath);

		// Used when entry is selected in dropdown
		tera.loadedEntries = entries ? entries : {};

		// Don't show current entry
		if(entries && Object.keys(entries).length > 0) delete entries[tera.session];

		// Build entry list
		if(entries && Object.keys(entries).length > 0) {
			var timestamps = [],
				timestamp,
				html = '';

			// Grab all timestamps and sort them newest > oldest
			for(timestamp in entries) {
				timestamps.push(parseInt(timestamp));
			}
			timestamps.sort().reverse();

			// Loop through timestamps in order and build entries
			for(timestamp in timestamps) {
				var timestamp = timestamps[timestamp];
					entry = entries[timestamp],
					prepStr = tera.helpers.encodeHTML(entry.value).substring(0,50);

				html += '<li data-timestamp="'+ timestamp +'"><span class="icon-right" title="Delete entry" data-delete="'+ timestamp +'"></span>'+ prepStr +'</li>';
			}
			html += '<li data-delete-all="'+ inHashPath +'">Delete all entries</li>';

			tera.UIResults.innerHTML = html;

		// No entries, show fallback
		} else {
			tera.UIResults.innerHTML = '<li>Nothing to recover</li>';
		}

		tera.positionUI();
	}

	tera.positionUI = function() {
		var inputRect = tera.UICurrentInput.getBoundingClientRect(),
			bodyRect = document.body.getBoundingClientRect(),
			UIWidth = 250, leftPos = 0,
			inputBodyOffset = inputRect.left - bodyRect.left;

		// First try to align on right side of input
		if((inputRect.left + inputRect.width + UIWidth) <= document.documentElement.clientWidth) {
			leftPos = inputBodyOffset + inputRect.width;

		// Otherwise align on left side of input
		} else if((inputRect.left - UIWidth) > 0) {
			leftPos = inputBodyOffset - UIWidth;

		// Otherwise align right side of window
		} else {
			leftPos = document.documentElement.clientWidth - UIWidth;
		}

		teraUI.style = 'top: '+ (inputRect.top + window.scrollY) +'px; left: '+ leftPos +'px;';
	}

	tera.showUI = function() {
		teraUI.classList.remove('hidden');
		tera.UIIsShowing = true;
	};
	tera.hideUI = function() {
		teraUI.classList.add('hidden');
		tera.UIIsShowing = false;
	};

	tera.saveEntry = function(e) {
		var elem = e.target || e,
			path = tera.generateDomPath(elem),
			value = tera.getInputValue(elem),
			cleanValue = tera.helpers.encodeHTML(value),
			elemPathHash = tera.helpers.hashCode(path);

		// Min length of string to save
		if(cleanValue.length < 3) {
			return false;
		}

		var currValue = localStorage.getItem(tera.storagePrefix + elemPathHash),
			currValue = JSON.parse(currValue),
			currValue = currValue ? currValue : {};

		currValue = tera.prepareEntryObject(currValue, 10);

		currValue[tera.session] = {
			"value" : value,
			"path" : path
		}

		// Update storage
		currValue = JSON.stringify(currValue);
		localStorage.setItem(tera.storagePrefix + elemPathHash, currValue);
	}

	tera.deleteEntry = function(timestamp) {
		var input = tera.UICurrentInput,
			inPath = tera.generateDomPath(input),
			elemPathHash = tera.helpers.hashCode(inPath),
			currValue = localStorage.getItem(tera.storagePrefix + elemPathHash),

			currValue = JSON.parse(currValue),
			currValue = currValue ? currValue : {};

		delete currValue[timestamp];

		// If this is the last entry, just delete the whole storage item
		if(Object.keys(currValue).length === 0) {
			localStorage.removeItem(tera.storagePrefix + elemPathHash);

		// Otherwise save storage item
		} else {
			currValue = JSON.stringify(currValue);
			localStorage.setItem(tera.storagePrefix + elemPathHash, currValue);
		}
	}

	tera.deleteAllEntriesByPathHash = function(hash) {
		var entries = localStorage.getItem(tera.storagePrefix + hash),
			entries = JSON.parse(entries),
			entries = entries ? entries : {};

		if(Object.keys(entries).length > 0) {
			localStorage.removeItem(tera.storagePrefix + hash)
		}
	}

	tera.getEntriesByPath = function(path) {
		var hashedPath = tera.helpers.hashCode(path),
			values = localStorage.getItem(tera.storagePrefix + hashedPath),
			values = values ? JSON.parse(values) : null;

		return values;
	}

	tera.prepareEntryObject = function(obj, size) {

		var timestamps = [], timestamp, count = 0, sliced = {};

		// Store all timestamps
		for(timestamp in obj) {
			if(obj.hasOwnProperty(timestamp)) {
				timestamps.push(parseInt(timestamp));
			}
		}

		// Sort timestamps
		timestamps = timestamps.sort(function(a, b) {
			return a - b;
		}).reverse();

		// Grab X values from obj in order of sorted timestamps
		for(; count < timestamps.length; ++count) {
			if(count >= size) break;
			sliced[timestamps[count]] = obj[timestamps[count]];
		}

		return sliced;
	};

	tera.parent = function(startElement, fn) {
		var parent = startElement.parentElement;
		if (!parent) return undefined;
		return fn(parent) ? parent : tera.parent(parent, fn);
	}

	tera.generateDomPath = function(el) {
		// Check easy way first
		if(el.id) {
			return '#' + el.id;
		}

		var stack = [];
		while (el.parentNode != null) {
			var sibCount = 0;
			var sibIndex = 0;
			// get sibling indexes
			for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
				var sib = el.parentNode.childNodes[i];
				if ( sib.nodeName == el.nodeName ) {
					if ( sib === el ) {
						sibIndex = sibCount;
					}
					sibCount++;
				}
			}
			var nodeName = el.nodeName.toLowerCase();
			if ( sibCount > 1 ) {
				stack.unshift(nodeName + ':nth-of-type(' + (sibIndex + 1) + ')');
			} else {
				stack.unshift(nodeName);
			}
			el = el.parentNode;
		}
		stack.splice(0,1); // removes the html element
		return stack.join(' > ');
	}


	tera.helpers.hashCode = function(str){
		var hash = 0;
		if (str.length == 0) return hash;
		for (i = 0; i < str.length; i++) {
			char = str.charCodeAt(i);
			hash = ((hash<<5)-hash)+char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
	}

	tera.helpers.encodeHTML = function(str) {
		return str.replace(/<\/?[^>]+(>|$)/g, "").replace(/[\"&'\/<>]/g, function (a) {
			return {
				'"': '&quot;', '&': '&amp;', "'": '&#39;',
				'/': '&#47;',  '<': '&lt;',  '>': '&gt;'
			}[a];
		});
	}


	// Alright this works but i don't really understand it
	// and it's probably not implemented correctly. Should fix.
	/*
	tera.helpers.debounce = function(fn, delay) {
		var context = this, args = arguments;
		clearTimeout(tera.helpers.debounce.func);
		tera.helpers.debounce.func = setTimeout(function () {
			fn.apply(context, args);
		}, delay);
	}
	tera.helpers.debounce.func = null;
	*/

	// Used to check if script is already injected. Message is sent from background.js
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'ping') {
			sendResponse(true);
		}
		else if(request.action === 'contextMenuRecover') {
			if(tera.UICurrentInput) {
				tera.buildUI();
				tera.showUI();
			}
		}
	});




	document.addEventListener('contextmenu', function(e) {
		if(tera.UIIsShowing) tera.hideUI();
		var newInput = tera.getEditable(e.target);

		if(newInput) {
			tera.UICurrentInput = newInput;
		} else {
			tera.UICurrentInput = undefined;
		}
	});

	document.addEventListener('click', function(e) {
		if(tera.UIIsShowing) tera.hideUI();
	});

	window.addEventListener('resize', function() {
		if(tera.UIIsShowing) {
			tera.positionUI();
		}
	});

	document.addEventListener('keyup', function(e) {
		var target = e.target;

		if(tera.isEditable(target)) {
			tera.saveEntry(target);
		}
	});

	document.addEventListener('focus', function(e) {
		if(tera.UIIsShowing) tera.hideUI();
	}, true);

	tera.UIResults.addEventListener('click', function(e) {
		var item = e.target,
			input = tera.UICurrentInput;

		// If delete was clicked
		if('delete' in item.dataset) {

			var ul = item.parentElement.parentElement;

			// Delete from storage and delete dom entry
			tera.deleteEntry(item.dataset.delete);
			item.parentElement.remove();

			// Restore input text from before hovering
			tera.setInputValue(input.dataset.orgValue);
			delete input.dataset.orgValue;
			input.classList.remove('teraUIActiveInput');

			// If no more entries, hide
			var lis = ul.querySelector('li[data-timestamp]');
			if(!ul.querySelector('li[data-timestamp]')) {
				tera.hideUI();
			}

			e.stopPropagation();
			return true;

		// If delete all was clicked
		} else if('deleteAll' in item.dataset) {
			var hashPath = item.dataset.deleteAll;
			tera.deleteAllEntriesByPathHash(hashPath);
			tera.hideUI();
		}
		if(item.dataset.timestamp !== undefined) {
			tera.setInputValueByTimestamp(item.dataset.timestamp);
			delete input.dataset.orgValue;
		}

		tera.hideUI();
		input.classList.remove('teraUIActiveInput');

		e.stopPropagation();
	});

	tera.UIResults.addEventListener('mouseover', function(e) {
		var item = e.target,
			input = tera.UICurrentInput,
			timestamp = item.dataset.timestamp;

		if(input.dataset.orgValue === undefined) {
			input.dataset.orgValue = tera.getInputValue(input);
		}
		if(timestamp === undefined) {
			return false;
		}

		input.classList.add('teraUIActiveInput');
		tera.setInputValueByTimestamp(timestamp);
	});

	tera.UIResults.addEventListener('mouseleave', function(e) {
		var input = tera.UICurrentInput;

		if(input.dataset.orgValue !== undefined) {
			tera.setInputValue(input.dataset.orgValue);
			delete input.dataset.orgValue;
		}
		input.classList.remove('teraUIActiveInput');
	});


	tera.init();


})();