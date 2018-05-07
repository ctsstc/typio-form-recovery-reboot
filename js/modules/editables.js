window.terafm = window.terafm || {};
terafm.editables = {};

(function(editables) {
	'use strict';
	
	const editableTypes = ['color', 'date', 'datetime-local', 'email', 'month', 'number', 'password', 'checkbox', 'radio', 'range', 'search', 'tel', 'text', 'time', 'url', 'week', 'contenteditable', 'textarea'];
	const textEditableTypes = ['text', 'email', 'search', 'password', 'url', 'tel', 'number', 'contenteditable', 'textarea'];

	let editableCache = new Map();

	editables.get = (el) => getEditable(el);
	editables.getTextEditable = (el) => getEditable(el, true);

	editables.isEditableType = (type) => editableTypes.includes(type);
	editables.isTextEditableType = (type) => textEditableTypes.includes(type);


	function getEditable(el, onlyTextEditable=false) {
		// If path, resolve it
		if(typeof el === 'string') el = terafm.cache(el, () => terafm.resolvePath(el));

		if(el && editableCache.has(el)) {
			let ed = editableCache.get(el);
			return !onlyTextEditable || (onlyTextEditable && ed.isTextEditable()) ? ed : false;

		} else if(!onlyTextEditable && editables.isEditable(el) || onlyTextEditable && editables.isTextEditable(el)) {
			let ed = new terafm.Editable(el);
			editableCache.set(el, ed);
			return ed;
		}

		return false;
	}
	

	editables.generateId = (path) => {
		return 'field' + terafm.help.hashStr(path);
	}

	editables.getType = (el) => {
		return el.type ? el.type : 'contenteditable'
	}

	editables.isEditable = (elem) => {
		if(!editables.isElement(elem)) return false;

		if(editables.isNode(elem, 'INPUT') && editables.isEditableType(elem.type)) {
			return true;

		} else if(editables.isNode(elem, 'TEXTAREA')) {
			return true;

		} else if(editables.isNode(elem, 'SELECT')) {
			return true;

		} else if(elem.getAttribute('contenteditable') == 'true') {
			return true;
		}

		return false;
	}
	editables.isTextEditable = (elem) => {
		if(!editables.isElement(elem)) return false;

		if(editables.isNode(elem, 'INPUT') && editables.isTextEditableType(elem.type)) {
			return true;

		} else if(elem.getAttribute('contenteditable') == 'true') {
			return true;

		} else if(editables.isNode(elem, 'TEXTAREA')) {
			return true;
		}

		return false;
	}
	editables.isContentEditable = (elem) => {
		return elem.contentEditable === 'true';
	}
	editables.isBigTextEditable = (elem) => {
		return elem.contentEditable === 'true' || elem.type === 'textarea';
	}

	editables.isElement = (elem) => {
		if(elem.ownerDocument && elem.ownerDocument.defaultView) {
			if(elem instanceof elem.ownerDocument.defaultView.HTMLElement) {
				return true;
			}
		}
		return false;
	}

	editables.isNode = (elem, compare) => {
		return (elem.nodeName + '').toLowerCase() === compare.toLowerCase();
	}







	editables.highlighted = {};

	editables.resetPlaceholders = () => {
		for(let eid in editables.highlighted) {
			editables.highlighted[eid].resetPlaceholder();
		}
	}

	editables.isEditableType = type => editableTypes.includes(type);
	editables.isTextEditableType = type => textEditableTypes.includes(type);

})(terafm.editables);