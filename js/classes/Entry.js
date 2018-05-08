window.terafm = window.terafm || {};

terafm.Entry = class Entry {
	constructor(arg, opts = {resolveUncheckedRadios: false}) {
		this.obj = {};

		// Make Entry from editable
		if(arg instanceof terafm.Editable) {

			if(opts.resolveUncheckedRadios && arg.type === 'radio') {
				arg = this.resolveRadio(arg) || arg;
			}

			this._editable = arg;
			this.editableId = this._editable.id;
			this.sessionId = this._editable.sessionId;

			this.obj.value = arg.getValue();
			this.obj.path = arg.path;
			this.obj.type = arg.type;
			
			var meta = arg.getMeta();
			if(meta) this.obj.meta = meta;

		} else {
			Object.assign(this, arg);
		}
	}

	resolveRadio(ed) {
		if(ed.type === 'radio' && ed.getValue() == false) {
			let sel = ed.el.getRootNode().querySelector('input[type=radio][name="'+ ed.el.name +'"]:checked');
			if(sel) return new terafm.Editable(sel);
		}
	}

	copy(opts) {
		return new terafm.Entry(this.getEditable(), opts);
	}

	isTextType() {
		return terafm.editables.isTextEditableType(this.obj.type);
	}

	getValue(opts = {encodeHTMLEntities: false, decodeHTMLEntities: false, stripTags: false, truncate: false, trim: false, retainLineBreaks: false}) {

		var str = this.obj.value;

		if(opts.stripTags) {
			str = terafm.help.stripTags(str);
		}

		if(opts.encodeHTMLEntities) {
			str = terafm.help.encodeHTMLEntities(terafm.help.stripTags(str));
		}

		if(opts.decodeHTMLEntities) {
			str = terafm.help.decodeHTMLEntities(terafm.help.stripTags(str));
		}

		if(typeof opts.truncate === 'number' && str.length > opts.truncate) {
			str = str.substring(0, opts.truncate) + '...';
		}

		if(opts.retainLineBreaks) {
			str = str.replace(/[\r\n]/gm, '<br/>');
		}

		if(opts.trim) {
			str = terafm.help.trim(str);
		}

		return str;
	}

	getPrintableValue(opts) {
		let value = '';
		let entry = this.obj;

		if(entry.type === 'radio' && entry.meta) {
			value += entry.meta; // Meta contains name:value, we don't care about the value here (its always 1 because its selected)

		} else if(entry.type === 'checkbox' && entry.meta) {
			value += entry.meta + (entry.value == '1' ? ' (checked)' : ' (unchecked)');

		} else {
			if(entry.meta) {
				value = entry.meta + ': ';
			}

			if(entry.type === 'contenteditable') {
				value += this.getValue({stripTags: true, trim: true, ...opts});
			} else {
				value += this.getValue({encodeHTMLEntities: true, trim: true, ...opts});
			}
		}

		return value;
	}

	setPlaceholder() {
		let editable = this.getEditable();
		if(editable) {
			editable.applyPlaceholderEntry(this);
		}
	}

	restore(opts={flash: false}) {
		let editable = this.getEditable();
		if(editable) {
			editable.applyEntry(this);
			if(terafm.options.get('cloneOnRestore') === true) editable.getEntry().save();
			if(opts.flash) editable.flashHighlight();
		}
	}

	save() {
		terafm.db.saveEntry(this);
	}

	getSession() {
		return this.session;// = terafm.db.getSession(this.sessionId);
	}

	hasEditable() {
		return !!this.getEditable();
	}

	getEditable() {
		if(this._editable !== undefined) {
			return this._editable;
		} else {
			this._editable = terafm.editables.get(this.obj.path);
			return this._editable;
		}
	}

	delete(callback) {
		terafm.db.del(this.sessionId, this.editableId, callback);
	}
}