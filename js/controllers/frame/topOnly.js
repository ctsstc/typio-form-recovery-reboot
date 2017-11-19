(function(db, options, contextMenu) {
	'use strict';

	// Run once in top window
	if(window === window.top) {

		window.top.addEventListener('message', function(msg) {

			// Save request from child frame
			if(msg.data.action && msg.data.action === 'terafmSave') {
				msg = msg.data.data;
				db.saveRevision(msg.editableId, msg.data);

			// Child frame requested options
			} else if(msg.data.action && msg.data.action === 'terafmRequestOptions') {

				window.top.postMessage({
					action: 'terafmReturnOptions',
					data: options.getAll()
				}, '*');

			// Child frame hide context menu
			} else if(msg.data.action && msg.data.action === 'terafmHideContextMenu') {
				contextMenu.hide();
			}
		})

	}

})(terafm.db, terafm.options, terafm.contextMenu);