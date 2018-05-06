window.terafm = window.terafm || {};
terafm.editables = {};

(function(editables) {
	'use strict';
	
	const editableTypes = ['color', 'date', 'datetime-local', 'email', 'month', 'number', 'password', 'checkbox', 'radio', 'range', 'search', 'tel', 'text', 'time', 'url', 'week', 'contenteditable'];
	const textEditableTypes = ['text', 'email', 'search', 'password', 'url', 'tel', 'number', 'contenteditable'];

	editables.highlighted = {};

	editables.resetPlaceholders = () => {
		for(let eid in editables.highlighted) {
			editables.highlighted[eid].resetPlaceholder();
		}
	}

	editables.isEditableType = type => editableTypes.includes(type);
	editables.isTextEditableType = type => textEditableTypes.includes(type);

})(terafm.editables);