window.terafm = window.terafm || {};

(function() {

	window.terafm.ui = {

		parent: function(elem, cb) {
			var parent = elem.parentElement;
			if (!parent) return undefined;
			return fn(parent) ? parent : tera.parent(parent, cb);
		}
	}


	/*function resultListClickHandler(e) {
		var item = e.target,
			inputPath = terafm.ui.generateDomPath(contextTarget);

		// If delete was clicked
		if('delete' in item.dataset) {

			var ul = item.parentElement.parentElement;

			// Delete from storage and delete dom entry
			terafm.db.deleteSingleRevisionByInput(inputPath, item.dataset.delete)
			item.parentElement.remove();

			// Restore input text from before hovering
			resetPlaceholders();

			// If no more entries, hide
			var lis = ul.querySelector('li[data-session]');
			if(!ul.querySelector('li[data-session]')) {
				hideResultList();
			}

			e.stopPropagation();
			return true;

		// If delete all was clicked
		} else if('deleteAll' in item.dataset) {
			var hashPath = item.dataset.deleteAll;
			terafm.db.deleteAllRevisionsByEditable(inputPath);
		
		// Browse all dialog
		} else if('browseAll' in item.dataset) {
			buildDialog();
		}

		hideResultList();
		resetPlaceholders(true); // Remove placeholder styling from all inputs, keeps the text

		e.stopPropagation();
	}*/

})();