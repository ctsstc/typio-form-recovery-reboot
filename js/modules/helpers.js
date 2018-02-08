window.terafm = window.terafm || {};
terafm.help = (function() {
	'use strict';

	var exp = {};

	exp.hashStr = function(str) {
		var hash = 0;
		if (str.length == 0) return hash;
		for (var i = 0; i < str.length; i++) {
			var char = str.charCodeAt(i);
			hash = ((hash<<5)-hash)+char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
	}

	exp.encodeHTML = function(str) {
		return (str + "").replace(/<\/?[^>]+(>|$)/g, "").replace(/[\"&'\/<>]/g, function (a) {
			return {
				'"': '&quot;', '&': '&amp;', "'": '&#39;',
				'/': '&#47;',  '<': '&lt;',  '>': '&gt;'
			}[a];
		}).trim();
	}

	exp.escapeRegExp = function(str) {
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}

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
				month: 'long',
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



	// https://davidwalsh.name/javascript-debounce-function
	// Returns a function, that, as long as it continues to be invoked, will not
	// be triggered. The exp.will = function be called after it stops being called for
	// N milliseconds. If `immediate` is passed, trigger the exp.on = function the
	// leading edge, instead of the trailing.
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


	exp.parentElem = function(elem, cb) {
		var parent = elem.parentElement;
		if (!parent) return undefined;
		return fn(parent) ? parent : parentElem(parent, cb);
	}

	exp.prettyKeys = function(keyarr) {

		for(var ki in keyarr) {
			keyarr[ki] = '<span class="key">' + keyarr[ki] + '</span> '
		}

		return keyarr.join(' + ')

	}

	return exp;
})();



