window.terafm = window.terafm || {};

(function() {

	window.terafm.ui = {

		parent: function(elem, cb) {
			var parent = elem.parentElement;
			if (!parent) return undefined;
			return fn(parent) ? parent : terafm.ui.parent(parent, cb);
		},

		deepQuerySelectorAll: function(selector) {
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
		},

		// https://stackoverflow.com/questions/442404/retrieve-the-position-x-y-of-an-html-element
		getOffset: function( el ) {
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
	}

})();