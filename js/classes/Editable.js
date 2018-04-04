window.terafm = window.terafm || {};

(function() {

	terafm.Editable = class Editable {
		constructor(el) {
			this.el = el;
		}

		get path() {
			return this._path ? this._path : this._path = terafm.generatePath(this.el);
		}
		get id() {
			return this._id ? this._id : this._id = generateId(this.path);
		}
		get type() {
			return this._type ? this._type : this._type = getType(this.el);
		}
		get sessionId() {
			return this._sessionId || terafm.db.getGlobalSessionId();
		}

		is(editable) {
			if(!(editable instanceof terafm.Editable)) throw new Error('Editable.is requires an editable to compare.');
			return this.el === editable.el;
		}

		flashHighlight() {
			this.highlight();
			setTimeout(this.remHighlight.bind(this), 	200);
			setTimeout(this.highlight.bind(this), 		400);
			setTimeout(this.remHighlight.bind(this),	600);
			setTimeout(this.highlight.bind(this), 		800);
			setTimeout(this.remHighlight.bind(this), 	1000);
		}

		isHighlighted() {
			return Object.keys(terafm.editables.highlighted).indexOf(this.id) !== -1;
		}

		highlight() {
			if(!this.isHighlighted()) {
				var attr = this.el.getAttribute('style') || '';
				this.el.terafmOrgStyle = attr;
				
				this.el.style.background = 'rgb(255, 251, 153)';
				this.el.style.color = '#222';
				terafm.editables.highlighted[this.id] = this;
			}
		}
		remHighlight() {
			// Todo: test if org style is restored
			if(this.isHighlighted() && this.el.terafmOrgStyle !== undefined) {
				this.el.setAttribute('style', this.el.terafmOrgStyle);
				delete this.el.terafmOrgStyle;
				delete terafm.editables.highlighted[this.id];
			}
		}

		resetPlaceholder() {
			this.restoreCachedValue();
			this.remHighlight()
		}

		cacheValue() {
			if(!this.orgValue) {
				this.orgValue = this.getValue();
			}
		}
		restoreCachedValue() {
			if(this.orgValue !== undefined) {
				this.setValue(this.orgValue);
				this.orgValue = undefined;
			}
		}

		applyPlaceholderEntry(entry) {
			this.cacheValue();
			this.applyEntry(entry, {truncate: true});
			this.highlight();
		}

		applyEntry(entry, opts = {truncate: false}) {
			if(!(entry instanceof terafm.Entry)) throw new Error('applyEntry requires an entry to set');

			let tmpVal = entry.obj.value;

			// If restoring html into text field, strip html and trim
			if(this.isContentEditable() === false && entry.obj.type === 'contenteditable') {
				tmpVal = terafm.help.stripTags(tmpVal);
				tmpVal = terafm.help.decodeHTMLEntities(tmpVal);
				tmpVal = terafm.help.trim(tmpVal);

			// Restoring text into html field
			} else if(this.isContentEditable() === true && entry.obj.type !== 'contenteditable') {
				tmpVal = terafm.help.encodeHTMLEntities(tmpVal);
			}

			if(opts.truncate && tmpVal.length > 500) {
				if(!(this.isContentEditable() && entry.type === 'contenteditable')) {
					tmpVal = tmpVal.substring(0, 500) + '... (truncated)';
				}
			}

			this.setValue(tmpVal);
		}

		getValue(trim) {
			let value;

			if(isNode(this.el, 'input') || isNode(this.el, 'textarea') || isNode(this.el, 'select')) {

				// Special care for checkable inputs
				if(this.el.type === 'checkbox' || this.el.type === 'radio') {
					value = this.el.checked ? '1' : '0';

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

			if(trim && typeof value === 'string') {
				return value.trim();
			}

			return value;
		}
		setValue(val) {
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

		touch() {
			if(this.isTextEditable()) {
				const currLen = this.getValue(true).length;
				const oldLen = this.length;

				// If input was cleared, set new ID
				if(oldLen > 1 && currLen === 0) {
					this._sessionId = terafm.db.generateSessionId();
					console.log('new id yo!');
				}

				this.length = currLen;
			}
		}

		getMeta() {
			if(this.isTextEditable()) return;

			// Checkbox or radio
			if(this.el.type && ['checkbox', 'radio'].includes(this.el.type) ) {
				return this.el.name + ': ' + this.el.value;

			// All other input types (select, range, color, date etc)
			} else if(this.el.type) {
				return this.el.name;
			}
		}

		isEditable() {
			return isEditable(this.el)
		}
		isTextEditable() {
			return isTextEditable(this.el)
		}
		isContentEditable() {
			return isContentEditable(this.el);
		}
		
		getEntry() {
			return new terafm.Entry(this);
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


	const editableTypes = ['color', 'date', 'datetime-local', 'email', 'month', 'number', 'password', 'checkbox', 'radio', 'range', 'search', 'tel', 'text', 'time', 'url', 'week'];
	const textEditableTypes = ['text', 'email', 'search', 'password', 'url', 'tel', 'number'];

	terafm.EditableFactory = arg => {
		if(typeof arg === 'string') {
			arg = terafm.cache(arg, () => terafm.resolvePath(arg))
		}
		if(isEditable(arg)) return terafm.cache(arg, () => new terafm.Editable(arg));
	}
	terafm.TextEditableFactory = el => {
		if(typeof arg === 'string') {
			arg = terafm.cache(arg, () => terafm.resolvePath(arg))
		}
		if(isTextEditable(el)) return terafm.cache(el, () => new terafm.Editable(el));
	}





	// Helper functions, not part of prototype

	function generateId(path) {
		return 'field' + terafm.help.hashStr(path);
	}

	function getType(el) {
		return el.type ? el.type : 'contenteditable'
	}

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
		if(elem.ownerDocument && elem.ownerDocument.defaultView) {
			if(elem instanceof elem.ownerDocument.defaultView.HTMLElement) {
				return true;
			}
		}
		return false;
	}

	function isNode(elem, compare) {
		return (elem.nodeName + '').toLowerCase() === compare.toLowerCase();
	}

})();