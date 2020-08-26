import Entry from './Entry';
import GeneratePath from '../modules/PathGenerator';
import Editables from '../modules/Editables';
import Helpers from '../modules/Helpers';
import SessionHandler from '../modules/SessionHandler';
import EditableDefaults from '../modules/EditableDefaults';
import Options from "../modules/options/options";

export default class Editable {
	constructor(el) {
		this.el = el;
		this.isHighlighed = false;
	}

	get path() {
		return this._path ? this._path : this._path = GeneratePath(this.el);
	}
	get id() {
		return this._id ? this._id : this._id = Editables.generateId(this.path);
	}
	get type() {
		return this._type ? this._type : this._type = Editables.getType(this.el);
	}
	get sessionId() {
		return this._sessionId || SessionHandler.getGlobalSessionId();
	}

	get metaString() {
		if(this.isTextEditable()) return;

		// Checkbox or radio
		if(this.el.type && ['checkbox', 'radio'].includes(this.el.type) ) {
			return this.el.name + ': ' + this.el.value;

		// All other input types (select, range, color, date etc)
		} else if(this.el.type) {
			return this.el.name;
		}
	}

	is(editable) {
		if(!(editable instanceof Editable)) throw new Error('Editable.is requires an editable to compare.');
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

	highlight() {
		if(!this.isHighlighed) {
			var attr = this.el.getAttribute('style') || '';
			this.el.terafmOrgStyle = attr;
			this.el.style.background = 'rgb(255, 251, 153)';
			this.el.style.color = '#222';
			this.isHighlighed = true;
		}
	}
	remHighlight() {
		if(this.isHighlighed && this.el.terafmOrgStyle !== undefined) {
			this.el.setAttribute('style', this.el.terafmOrgStyle);
			delete this.el.terafmOrgStyle;
			this.isHighlighed = false;
		}
	}

	applyPlaceholderEntry(entry) {
		this.applyEntry(entry, {truncate: this.isContentEditable() ? false : 5000});
		this.highlight();
	}

	applyEntry(entry, opts, dbRef) {
		if(!(entry instanceof Entry)) throw new Error('applyEntry requires an entry to set');
		
		let tmpVal;

		// contenteditable into text
		if(false === this.isContentEditable() && entry.type === 'contenteditable') {
			tmpVal = entry.getValue({stripTags: true, decodeHTMLEntities: true, trim: true, ...opts});

		// text into contenteditable
		} else if(true === this.isContentEditable() && entry.type !== 'contenteditable') {
			tmpVal = entry.getValue({encodeHTMLEntities: true, ...opts});

		} else if (this.isContentEditable() && entry.type === 'contenteditable') {
			tmpVal = entry.getValue({stripTags: true, decodeHTMLEntities: true, trim: true, ...opts});

		} else {
			tmpVal = entry.getValue(opts)
		}

		if(opts && opts.clone === true && dbRef && Options.get('cloneOnRestore') === true) {
			entry.cloneToCurrentSession(dbRef);
		}

		this.setValue(tmpVal);
	}

	getValue(trim) {
		let value;

		if(Editables.isNode(this.el, 'input') || Editables.isNode(this.el, 'textarea') || Editables.isNode(this.el, 'select')) {

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

		value += '';

		if(trim) {
			return value.trim();
		}

		return value;
	}
	setValue(val) {
		Editables.pauseLoggingForJustABit();
		EditableDefaults.add(this);

		window.terafm.isRestoring = true;

		if(Editables.isNode(this.el, 'INPUT') || Editables.isNode(this.el, 'TEXTAREA')) {

			if(this.el.type === 'checkbox' || this.el.type === 'radio') {
				val = parseInt(val);
				this.el.checked = val ? true : false;

			} else {
				this.el.value = val;
			}

		} else if(Editables.isNode(this.el, 'SELECT')) {
			this.el.value = val;

		} else {
			this.el.focus();

			const ownerDocument = this.el.ownerDocument;

			// DraftJS hack. If empty, simulate a keystroke first.
			if (!this.el.textContent) {
				const event = ownerDocument.createEvent('TextEvent');
				event.initTextEvent('textInput', true, true, window, '_', 0, '');
				this.el.dispatchEvent(event);
			}
			
			// innerHTML leads to issues with DraftJS
			//this.el.innerHTML = val;

			ownerDocument.execCommand('selectAll', false, null);
			ownerDocument.execCommand('insertHTML', false, val);
		}

		// Needed in order for state based editors to recognize the update (e.g. Vue or React)
		this.el.dispatchEvent(new Event('input', { bubbles: true }));
		this.el.dispatchEvent(new Event('change', { bubbles: true }));

		window.terafm.isRestoring = false;
	}

	touch() {
		if(this.isTextEditable()) {
			const currLen = this.getValue(true).length;
			const oldLen = this.length;

			// If input was cleared, set new ID
			if(oldLen > 1 && currLen === 0) {
				this._sessionId = SessionHandler.generateSessionId();
			}

			this.length = currLen;
		}
	}

	isEmpty() {
		if(this.isContentEditable()) {
			let txt = Helpers.trim(this.el.innerText);
			return txt.length < 1;
		} else {
			return (this.getValue() + '').trim().length < 1;
		}
	}

	isEditable() {
		return Editables.isEditable(this.el)
	}
	isTextEditable() {
		return Editables.isTextEditable(this.el)
	}
	isContentEditable() {
		return Editables.isContentEditable(this.el);
	}
	isBigTextEditable() {
		return Editables.isBigTextEditable(this.el);
	}
	
	getEntry(opts) {
		return new Entry(this, opts);
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

