;(function() {

	document.body.insertAdjacentHTML('afterbegin', "<div id='teraUI' class='hidden'><ul class='result-list'></ul></div>");


	var tera = {};
	tera.helpers = {};

	tera.UI = document.querySelector('#teraUI');
	tera.UIResults = teraUI.querySelector('.result-list');
	tera.UIIsShowing = false;
	tera.session = (new Date).getTime();
	tera.UICurrentInput = undefined;
	tera.loadedEntries = {};


	document.addEventListener('contextmenu', function(e) {
		tera.UICurrentInput = tera.getEditable(e.target);
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
		if(tera.isEditable(e.target)) {
			tera.saveEntry(e);
		}
	});

	document.addEventListener('focus', function(e) {
		if(tera.UIIsShowing) tera.hideUI();
	}, true);

	tera.UIResults.addEventListener('click', function(e) {
		var item = e.target,
			input = tera.UICurrentInput;

		if('delete' in item.dataset) {

			// Delete from storage and delete dom entry
			tera.deleteEntry(item.dataset.delete);
			item.parentElement.remove();

			// Restore input text from before hovering
			tera.setInputValue(input.dataset.orgValue);
			delete input.dataset.orgValue;
			input.classList.remove('teraUIActiveInput');

			e.stopPropagation();
			return true;
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
		if(elem.nodeName == 'INPUT' || elem.nodeName == 'TEXTAREA' || elem.getAttribute('contenteditable') == 'true') {
			return true;
		}
		return false;
	}
	
	// Check if element is editable OR is within a contenteditable parent
	tera.getEditable = function(elem) {
		if(elem.nodeName == 'INPUT' || elem.nodeName == 'TEXTAREA' || elem.getAttribute('contenteditable') == 'true') {
			return elem;
		}
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
			inValues = tera.getEntryByPath(inPath);

		tera.loadedEntries = inValues ? inValues : {};

		// Don't show current entry
		if(inValues && Object.keys(inValues).length > 0) delete inValues[tera.session];

		if(inValues && Object.keys(inValues).length > 0) {
			var html = '';
			for(var timestamp in inValues) {

				var valobj = inValues[timestamp],
					prepStr = tera.helpers.encodeHTML(valobj.value).substring(0,50);

				html += '<li data-timestamp="'+ timestamp +'"><span title="Delete entry" data-delete="'+ timestamp +'"></span>'+ prepStr +'</li>';
			}
			tera.UIResults.innerHTML = html;
		} else {
			tera.UIResults.innerHTML = '<li>Nothing to recover</li>';
		}

		tera.positionUI();
	}

	tera.positionUI = function() {
		var inputRect = tera.UICurrentInput.getBoundingClientRect(),
		UIWidth = 250, leftPos = 0;

		if((inputRect.left + inputRect.width + UIWidth) <= window.innerWidth) {
			leftPos = inputRect.left + inputRect.width;
		} else if((inputRect.left - UIWidth) > 0) {
			leftPos = inputRect.left - UIWidth;
		} else {
			leftPos = window.innerWidth - UIWidth;
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
		//tera.UICurrentInput = undefined;
	};

	tera.saveEntry = function(e) {
		var elem = e.target || e, // For testing
			path = tera.generateDomPath(elem),
			value = tera.getInputValue(elem),
			cleanValue = tera.helpers.encodeHTML(value),
			elemPathHash = "" + tera.helpers.hashCode(path);

		// Min length of string to save
		if(cleanValue.length < 3) {
			return false;
		}

		var currValue = sessionStorage.getItem('teraField-' + elemPathHash),
			currValue = JSON.parse(currValue),
			currValue = currValue ? currValue : {};

		currValue = tera.prepareEntryObject(currValue, 10);

		currValue[tera.session] = {
			"value" : value,
			"path" : path
		}

		// Update storage
		currValue = JSON.stringify(currValue);
		sessionStorage.setItem('teraField-' + elemPathHash, currValue);
	}

	tera.deleteEntry = function(timestamp) {
		var input = tera.UICurrentInput,
			inPath = tera.generateDomPath(input),
			elemPathHash = tera.helpers.hashCode(inPath),
			currValue = sessionStorage.getItem('teraField-' + elemPathHash),

			currValue = JSON.parse(currValue),
			currValue = currValue ? currValue : {};

		delete currValue[timestamp];

		// If this is the last entry, just delete the whole storage item
		if(Object.keys(currValue).length === 0) {
			sessionStorage.removeItem('teraField-' + elemPathHash);

		// Otherwise save storage item
		} else {
			currValue = JSON.stringify(currValue);
			sessionStorage.setItem('teraField-' + elemPathHash, currValue);
		}
	}

	tera.getEntryByPath = function(path) {
		var hashedPath = tera.helpers.hashCode(path),
			values = sessionStorage.getItem('teraField-' + hashedPath),
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

	// Used to check if script is already injected. Message is sent from background.js
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'ping') {
			sendResponse(true);
		}
		else if(request.action === 'contextMenuRecover') {
			tera.buildUI();
			tera.showUI();
		}
	});

})();