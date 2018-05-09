window.terafm = window.terafm || {};

terafm.Editable = class Editable {
	constructor(el) {
		this.el = el;
	}

	get path() {
		return this._path ? this._path : this._path = terafm.generatePath(this.el);
	}
	get id() {
		return this._id ? this._id : this._id = terafm.editables.generateId(this.path);
	}
	get type() {
		return this._type ? this._type : this._type = terafm.editables.getType(this.el);
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
		return terafm.editables.highlighted.contains(this)
	}

	highlight() {
		if(!this.isHighlighted()) {
			var attr = this.el.getAttribute('style') || '';
			this.el.terafmOrgStyle = attr;
			this.el.style.background = 'rgb(255, 251, 153)';
			this.el.style.color = '#222';
			terafm.editables.highlighted.push(this);
		}
	}
	remHighlight() {
		if(this.isHighlighted() && this.el.terafmOrgStyle !== undefined) {
			this.el.setAttribute('style', this.el.terafmOrgStyle);
			delete this.el.terafmOrgStyle;
			terafm.editables.highlighted.delete(this);
		}
	}

	applyPlaceholderEntry(entry) {
		this.applyEntry(entry, {truncate: true});
		this.highlight();
	}

	applyEntry(entry, opts = {truncate: false}) {
		if(!(entry instanceof terafm.Entry)) throw new Error('applyEntry requires an entry to set');
		
		let tmpVal = entry.obj.value;

		// If restoring html into text field, strip html and trim
		if(this.isContentEditable() === false && entry.obj.type === 'contenteditable') {
			tmpVal = entry.getValue({stripTags: true, decodeHTMLEntities: true, trim: true, ...opts});

		// Restoring text into html field
		} else if(this.isContentEditable() === true && entry.obj.type !== 'contenteditable') {
			tmpVal = entry.getValue({encodeHTMLEntities: true, ...opts});
		}

		this.setValue(tmpVal);
	}

	getValue(trim) {
		let value;

		if(terafm.editables.isNode(this.el, 'input') || terafm.editables.isNode(this.el, 'textarea') || terafm.editables.isNode(this.el, 'select')) {

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
		
		terafm.editables.pauseLoggingForJustABit();

		if(terafm.editables.isNode(this.el, 'INPUT') || terafm.editables.isNode(this.el, 'TEXTAREA')) {

			if(this.el.type === 'checkbox' || this.el.type === 'radio') {
				val = parseInt(val);
				this.el.checked = val ? true : false;

			} else {
				this.el.value = val;
			}

		} else if(terafm.editables.isNode(this.el, 'SELECT')) {
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
		return terafm.editables.isEditable(this.el)
	}
	isTextEditable() {
		return terafm.editables.isTextEditable(this.el)
	}
	isContentEditable() {
		return terafm.editables.isContentEditable(this.el);
	}
	isBigTextEditable() {
		return terafm.editables.isBigTextEditable(this.el);
	}
	
	getEntry(opts) {
		return new terafm.Entry(this, opts);
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

