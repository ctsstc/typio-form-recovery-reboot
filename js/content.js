;(function() {
	

	document.body.insertAdjacentHTML('afterbegin', "<div id='teraUI' class='hidden closed'><a class='opener'></a><ul class='result-list'></ul></div>");
	var teraUI = document.querySelector('#teraUI'),
		teraUIOpener = teraUI.querySelector('.opener'),
		teraUIResults = teraUI.querySelector('.result-list'),
		teraUIIsShowing = false,
		sessionId = Date.now(),
		teraUICurrentInput = undefined;

	teraUIResults.addEventListener('click', function(e) {
		var item = e.target,
			input = teraUICurrentInput;

		input.value = item.innerHTML;
		delete input.dataset.orgValue;
		teraUI.classList.add('closed');
	});

	teraUIResults.addEventListener('mouseover', function(e) {
		var item = e.target,
			input = teraUICurrentInput;

		if(input.dataset.orgValue === undefined) {
			input.dataset.orgValue = input.value;
		}
		input.value = item.innerHTML;
	});

	teraUIResults.addEventListener('mouseleave', function(e) {
		var input = teraUICurrentInput;

		if(input.dataset.orgValue !== undefined) {
			input.value = input.dataset.orgValue;
			delete input.dataset.orgValue;
		}
	});

	document.addEventListener('keyup', function(e) {
		if(e.target && (e.target.nodeName == 'INPUT' || e.target.nodeName == 'TEXTAREA')) {
			saveValue(e);
		}
	});

	document.addEventListener('focus', function(e) {
		if(e.target && (e.target.nodeName == 'INPUT' || e.target.nodeName == 'TEXTAREA')) {
			var input = e.target,
				inPath = getDomPath(input),
				inHashPath = inPath.hashCode(),
				inValues = getValuesByPath(inPath),
				inRect = input.getBoundingClientRect();

			teraUICurrentInput = input;

			teraUIIsShowing = true;
			teraUI.classList.remove('hidden');
			teraUI.classList.add('closed');
			teraUI.style = 'top: '+ (inRect.top + window.scrollY) +'px; left: '+ (inRect.left + inRect.width - 22) +'px;';

			if(inValues) {
				var html = '';
				for(var timestamp in inValues) {
					var valobj = inValues[timestamp];
					html += '<li>'+ valobj.value.encodeHTML() +'</li>';
				}
				teraUIResults.innerHTML = html;
			} else {
				teraUIResults.innerHTML = '<li class="nope">Nothing to recover</li>';
			}
		}
	}, true);

	document.addEventListener('click', function(e) {
		if(e.target.nodeName !== 'INPUT' && e.target.nodeName !== 'TEXTAREA' && teraUIIsShowing && e.target !== teraUIOpener && e.target !== teraUIResults && e.target.parentNode !== teraUIResults) {
			teraUI.classList.add('hidden');
			teraUI.classList.add('closed');
			teraUIIsShowing = false;
		}
	});

	teraUIOpener.addEventListener('click', function() {
		teraUI.classList.remove('closed');
	});

	function saveValue(e) {
		var path = getDomPath(e.target),
			elem = document.querySelector(path),
			elemId = elem.dataset.recId,
			value = elem.value;

		if(value.length < 3) {
			return false;
		}

		var elemForm = elem.form,
			elemFormPath = elemForm ? getDomPath(elemForm) : null,

			elemPathHash = ""+path.hashCode(),
			elemFormPathHash = elemFormPath ? ""+elemFormPath.hashCode() : "";

		var currValue = sessionStorage.getItem('field-' + elemPathHash),
			currValue = JSON.parse(currValue),
			currValue = currValue ? currValue : {};

		currValue[sessionId] = {
			"value" : value,
			"path" : path
		}

		currValue = JSON.stringify(currValue);

		sessionStorage.setItem('field-' + elemPathHash, currValue);
	}

	function getValuesByPath(path) {
		var hashedPath = path.hashCode(),
			values = sessionStorage.getItem('field-' + hashedPath),
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
			// console.log(el.nodeName);
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
			// if ( el.hasAttribute('id') && el.id != '' ) { no id shortcuts, ids are not unique in shadowDom
			//   stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
			// } else
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

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'ping') {
			sendResponse({
				message: true
			});
		}
	});


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
		return this.replace(/[\"&'\/<>]/g, function (a) {
			return {
				'"': '&quot;', '&': '&amp;', "'": '&#39;',
				'/': '&#47;',  '<': '&lt;',  '>': '&gt;'
			}[a];
		});
	}

})();