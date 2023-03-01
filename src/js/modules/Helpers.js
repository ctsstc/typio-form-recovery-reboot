let exp = {};

exp.hashStr = function(str) {
	var hash = 0;
	if (str.length == 0) return hash;
	for (var i = 0; i < str.length; i++) {
		var char = str.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash;
	}
	return hash;
}

exp.trim = function(str) {
	str = str.replace(/[^\S\r\n]+/g, ' ').replace(/[\r\n]+/g, '\r\n');
	return str.trim();
}

exp.trimNewLines = function(str) {
	return str.replace(/[\r\n]/g, '');
}

exp.stripTags = (() => {
	var tmp = document.createElement('div');
	return (html) => {
		tmp.innerHTML = html;
		
		// Delete <noscript> tags, they can contain HTML and it is not removed by this method
		const noscripts = tmp.querySelectorAll('noscript');
		for(const noscript of noscripts) {
			noscript.parentNode.removeChild(noscript);
		}

		return tmp.textContent;
	}
})();

// https://stackoverflow.com/a/47192491/290790
exp.encodeHTMLEntities = (function() {
	var doc = document.implementation.createDocument("", "", null),
		el = doc.createElement("terafmXMLTemp");
	el.textContent = "terafmXMLTemp";
	el = el.firstChild;
	var ser =  new XMLSerializer();
	return function(str) {
		el.nodeValue = str;
		return ser.serializeToString(el);
	};
})();

exp.decodeHTMLEntities = function(str) {
	var parser = new DOMParser,
		dom = parser.parseFromString('<!doctype html><body>' + str, 'text/html');

	return dom.body.textContent.trim();
}

// exp.escapeRegExp = function(str) {
// 	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
// }

exp.cloneObject = function(orgObj) {
	return Object.assign({}, orgObj);
}

exp.prettyDateFromTimestamp = function(timestamp) {
	var timezoneOffsetMs =  (new Date()).getTimezoneOffset() * 60000,
		date =  new Date( (timestamp*1000) - timezoneOffsetMs ),
		pretty = exp.prettyDate(date.toISOString());

	if(!pretty) {
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric'
		});
	}

	return pretty;
}

exp.prettyDate = function(time) {
	var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " ")),
	diff = (((new Date()).getTime() - date.getTime()) / 1000),
	day_diff = Math.floor(diff / 86400);

	if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) return;

	if(day_diff == 1) {
		return 'Yesterday at ' + date.getHours() + ':' + date.getMinutes();
	}

	return day_diff == 0 && (diff < 60 && "Just now" || diff < 120 && "1 minute ago" || diff < 3600 && Math.floor(diff / 60) + " minutes ago" || diff < 7200 && "1 hour ago" || diff < 86400 && Math.floor(diff / 3600) + " hours ago");
}


exp.copyToClipboard = function(text) {
	var textarea = document.createElement('textarea');
	textarea.innerHTML = text;
	textarea.setAttribute('class', 'typioIgnoreField');
	document.body.appendChild(textarea);
	textarea.select();

	var result = document.execCommand('copy');
	document.body.removeChild(textarea)
	return result;
}



// https://davidwalsh.name/javascript-debounce-function
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The exp.will = function be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the exp.on = function the
// leading edge, instead of the trailing.
/*
exp.debounce = function(func, wait, immediate, after) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate || after) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}
*/

// From underscore.js
// Found here: https://stackoverflow.com/a/27078401/290790
exp.throttle = function(func, wait, options) {
	var context, args, result;
	var timeout = null;
	var previous = 0;
	if (!options) options = {};
	var later = function() {
		previous = options.leading === false ? 0 : Date.now();
		timeout = null;
		result = func.apply(context, args);
		if (!timeout) context = args = null;
	};
	return function() {
		var now = Date.now();
		if (!previous && options.leading === false) previous = now;
		var remaining = wait - (now - previous);
		context = this;
		args = arguments;
		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			previous = now;
			result = func.apply(context, args);
			if (!timeout) context = args = null;
		} else if (!timeout && options.trailing !== false) {
			timeout = setTimeout(later, remaining);
		}
		return result;
	};
};

exp.prettyKeys = function(keyarr) {

	for(var ki in keyarr) {
		keyarr[ki] = '<span class="key">' + keyarr[ki] + '</span> '
	}

	return keyarr.join(' + ')

}

/**
 * Returns the target for the given event
 * @export
 * @param {Event} event
 * @returns {EventTarget | null}
 */
export function getEventTarget(event) {
	// event.path has been deprecated in Chrome 109 (Jan. 2023)
	// https://chromestatus.com/feature/5726124632965120
	if (event.composedPath) {
		return event.composedPath()[0];
	}
	else {
		// console.trace()
		// console.error("composedPath not found on event")
		return null
	}
}

export default exp;


