;(function() {
	
	document.body.insertAdjacentHTML('afterbegin', "<div id='teraUI' class='hidden'><ul class='result-list'></ul></div>");

	var teraUI = document.querySelector('#teraUI'),
		teraUIResults = teraUI.querySelector('.result-list'),
		teraUIIsShowing = false,
		sessionId = (new Date).getTime(),
		teraUICurrentInput = undefined,
		teraUICurrentLoadedValues = {};

	document.addEventListener('contextmenu', function(e) {
		if(e.button === 2) {
			teraUICurrentInput = getEditable(e.target);
		}
	});

	document.addEventListener('click', function(e) {
		if(teraUIIsShowing) hideUI();
	});

	window.addEventListener('resize', function() {
		if(teraUIIsShowing) {
			positionUI();
		}
	});

	teraUIResults.addEventListener('click', function(e) {
		var item = e.target,
			input = teraUICurrentInput;

		if(item.dataset.timestamp !== undefined) {
			setInputValueByTimestamp(item.dataset.timestamp);
			delete input.dataset.orgValue;
		}

		hideUI();
		input.classList.remove('teraUIActiveInput');

		e.stopPropagation();
	});

	teraUIResults.addEventListener('mouseover', function(e) {
		var item = e.target,
			input = teraUICurrentInput,
			timestamp = item.dataset.timestamp;

		if(input.dataset.orgValue === undefined) {
			input.dataset.orgValue = getInputValue(input);
		}
		if(timestamp === undefined) {
			return false;
		}

		input.classList.add('teraUIActiveInput');
		setInputValueByTimestamp(timestamp);
	});

	teraUIResults.addEventListener('mouseleave', function(e) {
		var input = teraUICurrentInput;

		if(input.dataset.orgValue !== undefined) {
			setInputValue(input.dataset.orgValue);
			delete input.dataset.orgValue;
		}
		input.classList.remove('teraUIActiveInput');
	});

	function getInputValue(elem) {
		if(elem.nodeName == 'INPUT' || elem.nodeName == 'TEXTAREA') {
			return elem.value;
		}
		return elem.innerHTML;
	}

	function setInputValue(val) {
		var input = teraUICurrentInput;
		if(input.nodeName == 'INPUT' || input.nodeName == 'TEXTAREA') {
			input.value = val;
		}
		input.innerHTML = val;
	}

	function setInputValueByTimestamp(timestamp) {
		if(!(timestamp in teraUICurrentLoadedValues)) {
			return false;
		}
		var valueObj = teraUICurrentLoadedValues[timestamp],
			input = teraUICurrentInput;

		if(input.nodeName == 'INPUT' || input.nodeName == 'TEXTAREA') {
			input.value = valueObj.value;
		}
		input.innerHTML = valueObj.value;
	}

	// Check if element is editable
	function isEditable(elem) {
		if(elem.nodeName == 'INPUT' || elem.nodeName == 'TEXTAREA' || elem.getAttribute('contenteditable') == 'true') {
			return true;
		}
		return false;
	}
	
	// Check if element is editable OR is within a contenteditable parent
	function getEditable(elem) {
		if(elem.nodeName == 'INPUT' || elem.nodeName == 'TEXTAREA' || elem.getAttribute('contenteditable') == 'true') {
			return elem;
		}
		return findClosestParent(elem, function(elem) { return elem.getAttribute('contenteditable') == 'true' })
	}

	document.addEventListener('keyup', function(e) {
		if(isEditable(e.target)) {
			saveValue(e);
		}
	});

	document.addEventListener('focus', function(e) {
		if(teraUIIsShowing) hideUI();
	}, true);

	function buildUI() {

		// If opened before window has finished loading
		if(!teraUICurrentInput) {
			confirm('shit');
			return false;
		}

		var input = teraUICurrentInput,
			inPath = getDomPath(input),
			inHashPath = inPath.hashCode(),
			inValues = getValuesByPath(inPath);

		teraUICurrentLoadedValues = inValues ? inValues : {};

		positionUI();

		if(inValues) {
			var html = '';
			for(var timestamp in inValues) {
				var valobj = inValues[timestamp],
					prepStr = valobj.value.encodeHTML().substring(0,50);

				html += '<li data-timestamp="'+ timestamp +'">'+ prepStr +'</li>';
			}
			teraUIResults.innerHTML = html;
		} else {
			teraUIResults.innerHTML = '<li>Nothing to recover</li>';
		}
	}

	function positionUI() {
		var inputRect = teraUICurrentInput.getBoundingClientRect(),
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

	function showUI() {
		teraUI.classList.remove('hidden');
		teraUIIsShowing = true;
	};
	function hideUI() {
		teraUI.classList.add('hidden');
		teraUIIsShowing = false;
		teraUICurrentInput = undefined;
	};

	function saveValue(e) {
		var elem = e.target,
			path = getDomPath(elem),
			value = getInputValue(elem),
			cleanValue = value.encodeHTML(),
			elemPathHash = ""+path.hashCode();

		// Min length of string to save
		if(cleanValue.length < 3) {
			return false;
		}

		var currValue = sessionStorage.getItem('teraField-' + elemPathHash),
			currValue = JSON.parse(currValue),
			currValue = currValue ? currValue : {};

		// Only store 10 versions
		currValue = sortAndSliceValues(currValue, 10);

		currValue[sessionId] = {
			"value" : value,
			"path" : path
		}

		currValue = JSON.stringify(currValue);

		sessionStorage.setItem('teraField-' + elemPathHash, currValue);
	}

	function getValuesByPath(path) {
		var hashedPath = path.hashCode(),
			values = sessionStorage.getItem('teraField-' + hashedPath),
			values = values ? JSON.parse(values) : null;

		return values;
	}


	function getDomPath(el) {
		if (!el) {
			return;
		}
		var stack = [];
		var isShadow = false;
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
			if (isShadow) {
				nodeName += "::shadow";
				isShadow = false;
			}
			if ( sibCount > 1 ) {
				stack.unshift(nodeName + ':nth-of-type(' + (sibIndex + 1) + ')');
			} else {
				stack.unshift(nodeName);
			}
			el = el.parentNode;
			if (el.nodeType === 11) { // for shadow dom, we
				isShadow = true;
				el = el.host;
			}
		}
		stack.splice(0,1); // removes the html element
		return stack.join(' > ');
	}


	String.prototype.hashCode = function(){
		var hash = 0;
		if (this.length == 0) return hash;
		for (i = 0; i < this.length; i++) {
			char = this.charCodeAt(i);
			hash = ((hash<<5)-hash)+char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
	}

	String.prototype.encodeHTML = function() {
		return this.replace(/<\/?[^>]+(>|$)/g, "").replace(/[\"&'\/<>]/g, function (a) {
			return {
				'"': '&quot;', '&': '&amp;', "'": '&#39;',
				'/': '&#47;',  '<': '&lt;',  '>': '&gt;'
			}[a];
		});
	}

	function findClosestParent (startElement, fn) {
		var parent = startElement.parentElement;
		if (!parent) return undefined;
		return fn(parent) ? parent : findClosestParent(parent, fn);
	}

	// Used to check if script is already injected. Message is sent from background.js
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'ping') {
			sendResponse(true);
		}
		else if(request.action === 'contextMenuRecover') {
			buildUI();
			showUI();
		}
	});

	function sortAndSliceValues(obj, size) {

		var timestamps = [], timestamp, count = 0, sliced = {};

		// Store all timestamps
		for(timestamp in obj) {
			if(obj.hasOwnProperty(timestamp)) {
				timestamps.push(timestamp);
			}
		}

		timestamps = timestamps.sort(function(a, b) {
			return a+b;
		});

		for(; count < timestamps.length; ++count) {
			if(count >= size) break;
			sliced[timestamps[count]] = obj[timestamps[count]];
		}

		return sliced;
	};

})();