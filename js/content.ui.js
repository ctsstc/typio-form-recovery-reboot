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
		}
	}

})();