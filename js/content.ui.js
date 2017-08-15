window.terafm = window.terafm || {};

(function() {

	window.terafm.ui = {

		parent: function(elem, cb) {
			var parent = elem.parentElement;
			if (!parent) return undefined;
			return fn(parent) ? parent : terafm.ui.parent(parent, cb);
		}
	}

})();