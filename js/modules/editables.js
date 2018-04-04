window.terafm = window.terafm || {};
terafm.editables = {};

(function(editables) {
	'use strict';

	editables.highlighted = {};

	editables.resetPlaceholders = () => {
		for(let eid in editables.highlighted) {
			editables.highlighted[eid].resetPlaceholder();
		}
	}

})(terafm.editables);