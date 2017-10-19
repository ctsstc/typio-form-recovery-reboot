
function isInShadow(node) {
	for (; node; node = node.parentNode) {
		if (node.toString() === "[object ShadowRoot]") {
			return true;
		}
	}
	return false;
}
function hashStr(str) {
	var hash = 0;
	if (str.length == 0) return hash;
	for (i = 0; i < str.length; i++) {
		char = str.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}

function encodeHTML(str) {
	return (str + "").replace(/<\/?[^>]+(>|$)/g, "").replace(/[\"&'\/<>]/g, function (a) {
		return {
			'"': '&quot;', '&': '&amp;', "'": '&#39;',
			'/': '&#47;',  '<': '&lt;',  '>': '&gt;'
		}[a];
	}).trim();
}

function escapeRegExp(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function cloneObject(orgObj) {
	return JSON.parse(JSON.stringify(orgObj));
}

function prettyDateFromTimestamp(timestamp) {
	var timezoneOffsetMs =  (new Date()).getTimezoneOffset() * 60000,
		date =  new Date( (timestamp*1000) - timezoneOffsetMs ),
		pretty = prettyDate(date.toISOString());

	if(!pretty) {
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric'
		});
	}

	return pretty;
}

function prettyDate(time) {
	var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " ")),
	diff = (((new Date()).getTime() - date.getTime()) / 1000),
	day_diff = Math.floor(diff / 86400);

	if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) return;

	if(day_diff == 1) {
		return 'Yesterday at ' + date.getHours() + ':' + date.getMinutes();
	}

	return day_diff == 0 && (diff < 60 && "just now" || diff < 120 && "1 minute ago" || diff < 3600 && Math.floor(diff / 60) + " minutes ago" || diff < 7200 && "1 hour ago" || diff < 86400 && Math.floor(diff / 3600) + " hours ago");
}

// querySelector with ::shadow support
function $(selector) {

	var hasShadow = selector.indexOf('::shadow') > -1 ? true : false;

	if(!hasShadow) {
		return document.querySelector(selector);
	
	} else {

		var splitSelector = selector.split(/::shadow[\s>]+/),
			currNode = window.top.document;

		for(var i = 0; i < splitSelector.length; ++i) {
			currNode = currNode.querySelector( splitSelector[i] );

			// If node was not found, abort
			if(!currNode) {
				return false;
			}

			// If node is shadow host, go inside
			if(currNode.shadowRoot) {
				currNode = currNode.shadowRoot;
			}
		}

		return currNode;

	}

}


// https://davidwalsh.name/javascript-debounce-function
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}


function parentElem(elem, cb) {
	var parent = elem.parentElement;
	if (!parent) return undefined;
	return fn(parent) ? parent : parentElem(parent, cb);
}

function deepQuerySelectorAll(selector) {
	var frames = window.top.document.querySelectorAll('iframe'),
		matches = [];

	frames.forEach(function(frame) {
		try{
			var fres = frame.contentDocument.querySelectorAll(selector);
			Array.prototype.push.apply(matches, fres);
		} catch(e) {};
	});

	var topres = window.top.document.querySelectorAll(selector);
	Array.prototype.push.apply(matches, topres);

	return matches.length ? matches : false;
}

// https://stackoverflow.com/questions/442404/retrieve-the-position-x-y-of-an-html-element
function getElemOffset( el ) {
	var _x = 0;
	var _y = 0;
	while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
		_x += el.offsetLeft - el.scrollLeft;
		_y += el.offsetTop - el.scrollTop;
		el = el.offsetParent;
	}

	// Added
	_y += window.scrollY;
	_x += window.scrollX;
	return { top: _y, left: _x };
}