;(function() {
	
	document.body.insertAdjacentHTML('afterbegin', "<div id='teraUI' class='hidden closed'><a class='opener'></a><ul class='result-list'></ul></div>");

	var teraUI = document.querySelector('#teraUI'),
		teraUIOpener = teraUI.querySelector('.opener'),
		teraUIResults = teraUI.querySelector('.result-list'),
		teraUIIsShowing = false,
		sessionId = (new Date).getTime(),
		teraUICurrentInput = undefined,
		teraUICurrentLoadedValues = {};

	teraUIOpener.addEventListener('click', function(e) {
		teraUI.classList.remove('closed');
		e.stopPropagation();
	});

	teraUIResults.addEventListener('click', function(e) {
		var item = e.target,
			input = teraUICurrentInput;

		if(item.dataset.timestamp !== undefined) {
			setInputValueByTimestamp(item.dataset.timestamp);
			delete input.dataset.orgValue;
		}
		else if(item.dataset.settingsLink !== undefined) {
			chrome.runtime.sendMessage({action: 'openSettings'});
		}
		else if(item.dataset.disableLink !== undefined) {
			chrome.runtime.sendMessage({action: 'blockDomain', domain: window.location.hostname});
		}

		teraUI.classList.add('closed');
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
		setInputValueByTimestamp(timestamp);
	});

	teraUIResults.addEventListener('mouseleave', function(e) {
		var input = teraUICurrentInput;

		if(input.dataset.orgValue !== undefined) {
			setInputValue(input.dataset.orgValue);
			delete input.dataset.orgValue;
		}
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

	function isEditable(elem) {
		if(elem.nodeName == 'INPUT' || elem.nodeName == 'TEXTAREA' || elem.getAttribute('contenteditable') === 'true') {
			return true;
		}
		return false;
	}

	document.addEventListener('keyup', function(e) {
		if(isEditable(e.target)) {
			saveValue(e);
		}
	});

	document.addEventListener('focus', function(e) {
		if(isEditable(e.target)) {
			var input = e.target,
				inPath = getDomPath(input),
				inHashPath = inPath.hashCode(),
				inValues = getValuesByPath(inPath),
				inRect = input.getBoundingClientRect();

			teraUICurrentInput = input;

			// Only show corner pop if it's not an input
			if(input.nodeName !== 'INPUT') {
				teraUIIsShowing = true;
				teraUI.classList.remove('hidden');
				teraUI.classList.add('closed');
			} else {
				teraUIIsShowing = false;
				teraUI.classList.add('hidden');
				teraUI.classList.add('closed');
			}

			teraUI.style = 'top: '+ (inRect.top + window.scrollY) +'px; left: '+ (inRect.left + inRect.width - 22) +'px;';

			teraUICurrentLoadedValues = inValues ? inValues : {};

			if(inValues) {
				var html = '';
				for(var timestamp in inValues) {
					var valobj = inValues[timestamp],
						prepStr = valobj.value.encodeHTML().substring(0,35);

					html += '<li data-timestamp="'+ timestamp +'">'+ prepStr +'</li>';
				}
				teraUIResults.innerHTML = html;
			} else {
				teraUIResults.innerHTML = '<li class="teraUI-ignore">Nothing to recover</li>';
			}
			teraUIResults.innerHTML += '<li class="separator"></li>';
			teraUIResults.innerHTML += '<li data-disable-link>Disable on '+ window.location.hostname +'</li>';
			teraUIResults.innerHTML += '<li data-settings-link>Settings</li>';
		}
	}, true);

	document.addEventListener('click', function(e) {
		// Sometimes contenteditable fields gain focus by clicking anywhere
		// within the parent form (even though you didn't click the contenteditable)
		// field itself. Therefore we check if the active element is editable as well.
		if(!isEditable(e.target) && !isEditable(document.activeElement)) {
			teraUI.classList.add('hidden');
			teraUI.classList.add('closed');
			teraUIIsShowing = false;
		}
	});

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
			sendResponse({
				message: true
			});
		}
		else if(request.action === 'contextMenuRecover') {
			teraUI.classList.remove('hidden');
			teraUI.classList.remove('closed');
			teraUIIsShowing = true;
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
			console.log(obj[timestamps[count]].value);
		}

		return sliced;
	};

})();