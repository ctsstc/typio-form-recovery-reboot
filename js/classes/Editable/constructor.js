window.terafm = window.terafm || {};

(function() {

	terafm.Editable = class Editable {
		constructor(el) {
			this.el = el;
			this._id = null;
			this._path = null;
		}
	}

	terafm.Editable.prototype.editableTypes = ['color', 'date', 'datetime-local', 'email', 'month', 'number', 'password', 'checkbox', 'radio', 'range', 'search', 'tel', 'text', 'time', 'url', 'week'];
	terafm.Editable.prototype.textEditableTypes = ['text', 'email', 'search', 'password', 'url', 'tel', 'number'];


	terafm.Editable.prototype.getRect = function() {
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
	// terafm.Editable.prototype.createEntryObject = function() {}
	terafm.Editable.prototype.generateEditableId = function() {}
	terafm.Editable.prototype.getEditableSessionId = function() {}
	terafm.Editable.prototype.deleteRadioSiblingsFromStorage = function() {}
	terafm.Editable.prototype.isContentEditable = function() {
		return this.el.contentEditable === 'true';
	}
	terafm.Editable.prototype.isEditable = function() {
		// Elem must be a valid html element
		if(!isElement(this.el)) return false;

		// Check if input with valid type
		if(isNode(this.el, 'INPUT') && this.editableTypes.includes(this.el.type)) {
			return true;

		// Check if textarea
		} else if(isNode(this.el, 'TEXTAREA')) {
			return true;

		} else if(isNode(this.el, 'SELECT')) {
			return true;

		// Check if contenteditable
		} else if(this.el.getAttribute('contenteditable') == 'true') {
			return true;
		}

		// Nah, fuck off mate-o
		return false;
	}
	terafm.Editable.prototype.isTextEditable = function() {
		if(!isElement(this.el)) return false;

		if(isNode(this.el, 'INPUT') && this.textEditableTypes.includes(this.el.type)) {
			return true;

		} else if(this.el.getAttribute('contenteditable') == 'true') {
			return true;

		} else if(isNode(this.el, 'TEXTAREA')) {
			return true;
		}

		return false;
	}
	terafm.Editable.prototype.getValue = function() {
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
	terafm.Editable.prototype.setValue = function(val) {
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
	
	// terafm.Editable.prototype.getEditable = function() {}
	// terafm.Editable.prototype.getTextEditable = function() {}

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
	

var el = document.querySelector('input[type=email]');
var ed = new terafm.Editable(el)
console.log(el)
console.log('isEditable', ed.isEditable());
console.log('isTextEditable', ed.isTextEditable());
console.log('getValue', ed.getValue());
console.log('setValue'); ed.setValue('Hello World!');
console.log('getValue', ed.getValue());

