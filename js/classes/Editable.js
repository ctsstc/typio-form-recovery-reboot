window.terafm = window.terafm || {};

(function() {

	const editableTypes = ['color', 'date', 'datetime-local', 'email', 'month', 'number', 'password', 'checkbox', 'radio', 'range', 'search', 'tel', 'text', 'time', 'url', 'week'];
	const textEditableTypes = ['text', 'email', 'search', 'password', 'url', 'tel', 'number'];

	terafm.EditableFactory = el => {
		if(isEditable(el)) return terafm.cache(el, () => new terafm.Editable(el));
	}
	terafm.TextEditableFactory = el => {
		if(isTextEditable(el)) return terafm.cache(el, () => new terafm.Editable(el));
	}

	terafm.Editable = class Editable {
		constructor(el) {
			this.el = el;
			this.path = terafm.generatePath(el)
			this.id = generateId(this.path)
		}

		get value() {
			let value;

			if(isNode(this.el, 'input') || isNode(this.el, 'textarea') || isNode(this.el, 'select')) {

				// Special care for checkable inputs
				if(this.el.type === 'checkbox' || this.el.type === 'radio') {
					value = this.el.checked ? 1 : 0;

				} else {
					value = this.el.value;
				}

			// Contenteditable
			} else {
				if(trim) {
					value = this.el.textContent;
				} else {
					value = this.el.innerHTML;
				}
			}

			// Todo: Needed?
			// if(typeof value === 'string') {
			// 	return value.trim();
			// }

			return value;
		}
		set value(val) {
			if(isNode(this.el, 'INPUT') || isNode(this.el, 'TEXTAREA')) {

				// Special care for checkable inputs
				if(this.el.type === 'checkbox') {
					val = parseInt(val);
					this.el.checked = val ? true : false;

				} else if(this.el.type === 'radio') {

					// Set by value
					if(val == parseInt(val)) {
						this.el.checked = true;

					// Set by path
					// Todo: What?? Also, change to deep selector?
					} else {
						var orgRadio = document.querySelector(val);
						if(orgRadio) {
							orgRadio.checked = true;
						}
					}

				} else {
					this.el.value = val;
				}

			} else if(isNode(this.el, 'SELECT')) {
				this.el.value = val;

			} else {
				this.el.innerHTML = val;
			}
		}

		isEditable() {
			return isEditable(this.el)
		}
		isTextEditable() {
			return isTextEditable(this.el)
		}
		
		getEntry() {
			return new Entry(this.el);
		}

		rect() {
			var parent = this.el,
				size = this.el.getBoundingClientRect(),
				bodyRect = bodyRect = document.body.getBoundingClientRect(),
				rect = {x: 0, y: 0, width: size.width, height: size.height};

			while(parent) {
				var prect = parent.getBoundingClientRect()
				rect.x += prect.x;
				rect.y += prect.y;

				if(parent !== this.el) {
					rect.x += parent.clientLeft;
					rect.y += parent.clientTop;
				}
				parent = parent.ownerDocument.defaultView.frameElement;
			}

			if(window.getComputedStyle(document.body)['position'] !== 'static') {

				// Make position relative to body
				rect.x -= bodyRect.x;
				rect.y -= bodyRect.y;

			} else {
				rect.x += window.scrollX;
				rect.y += window.scrollY;
			}

			return rect;
		}
	}

	function generateId(path) {
		return 'field' + terafm.help.hashStr(path);
	}


	// terafm.Editable.prototype.createEntryObject = function() {}
	// terafm.Editable.prototype.generateEditableId = function() {}
	// terafm.Editable.prototype.getEditableSessionId = function() {}
	// terafm.Editable.prototype.deleteRadioSiblingsFromStorage = function() {}



	// terafm.Editable.prototype.getEditable = function() {}
	// terafm.Editable.prototype.getTextEditable = function() {}


	function isEditable(elem) {
		if(!isElement(elem)) return false;

		if(isNode(elem, 'INPUT') && editableTypes.includes(elem.type)) {
			return true;

		} else if(isNode(elem, 'TEXTAREA')) {
			return true;

		} else if(isNode(elem, 'SELECT')) {
			return true;

		} else if(elem.getAttribute('contenteditable') == 'true') {
			return true;
		}

		return false;
	}
	function isTextEditable(elem) {
		if(!isElement(elem)) return false;

		if(isNode(elem, 'INPUT') && textEditableTypes.includes(elem.type)) {
			return true;

		} else if(elem.getAttribute('contenteditable') == 'true') {
			return true;

		} else if(isNode(elem, 'TEXTAREA')) {
			return true;
		}

		return false;
	}
	function isContentEditable(elem) {
		return elem.contentEditable === 'true';
	}

	function isElement(elem) {
		// Check if element has parent document and window
		if(elem.ownerDocument && elem.ownerDocument.defaultView) {

			// Check if it's of type HTMLElement from parent window
			if(elem instanceof elem.ownerDocument.defaultView.HTMLElement) {
				return true;
			}
		}

		return false;
	}

	function isNode(elem, compare) {
		if( (elem.nodeName + '').toLowerCase() === compare.toLowerCase() ) {
			return true;
		}
		return false;
	}

	function getEditableType(editable) {

		// Is input(various text types) or textarea or contenteditable
		if(editableManager.isEditableText(editable)) {
			return {
				type: editable.type ? editable.type : 'contenteditable'
			};

		// Checkbox or radio
		} else if(editable.type && ['checkbox', 'radio'].includes(editable.type) ) {
			return {
				type: editable.type,
				meta: editable.name + ': ' + editable.value,
			};

		// All other input types (select, range, color, date etc)
		} else if(editable.type) {
			return {
				type: editable.type,
				meta: editable.name
			};
		}
	}

})();