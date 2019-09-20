window.terafm = window.terafm || {};

terafm.Entry = class Entry {
	constructor(arg, opts = {resolveUncheckedRadios: false, context: null}) {
		this.meta = {};

		// Make Entry from editable
		if(arg instanceof terafm.Editable) {

			if(opts.resolveUncheckedRadios && arg.type === 'radio') {
				arg = this.resolveRadio(arg) || arg;
			}

			if(opts.context) {
				this.session = opts.context.session;
				this._editable = opts.context._editable;
			} else {
				this._editable = arg;
			}
			
			this.editableId = this._editable.id;
			this.sessionId = this._editable.sessionId;

			this.value = arg.getValue();
			this.meta.path = arg.path;
			this.meta.type = arg.type;

			var metaStr = arg.metaString;
			if(metaStr) this.meta.meta = metaStr;


		// Straight from DB, see StorageBucket.getEntry()
		} else {
			Object.assign(this, arg);
		}
	}

	get type() {
		return this.meta.type;
	}
	get path() {
		return this.meta.path;
	}
	get metaStr() {
		return this.meta.meta || '';
	}

	valueContains(string) {
		return this.getValue({ stripTags: this.type === 'contenteditable' })
			.replace(/\s/g, '')
			.toLowerCase()
			.indexOf(
				string.replace(/\s/g, '').toLowerCase()
			);
	}

	resolveRadio(ed) {
		if(ed.type === 'radio' && ed.el.checked === false) {
			let sel = ed.el.getRootNode().querySelector('input[type=radio][name="'+ ed.el.name +'"]:checked');
			if(sel) return new terafm.Editable(sel);
		}
		else return ed;
	}

	copy(opts) {
		// return new terafm.Entry(this, opts);
		return new terafm.Entry(this.getEditable(), {...opts, context: this});
	}

	isTextType() {
		return terafm.editables.isTextEditableType(this.type);
	}

	getValue(opts = {encodeHTMLEntities: false, decodeHTMLEntities: false, stripTags: false, truncate: false, trim: false, retainLineBreaks: false}) {

		var str = this.value;

		if(opts.stripTags) {
			str = terafm.help.stripTags(str);
		}

		if(opts.encodeHTMLEntities) {
			str = terafm.help.encodeHTMLEntities(str);
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

		console.log(str);

		return str;
	}

	getPrintableValue(opts) {
		let value = '';
		let entry = this;

		if(entry.type === 'radio' && entry.meta.meta) {
			value += terafm.help.encodeHTMLEntities(entry.meta.meta); // Meta contains name:value, we don't care about the "checked" value here (its always 1 because its selected)

		} else if(entry.type === 'checkbox' && entry.meta) {
			value += terafm.help.encodeHTMLEntities(entry.meta.meta) + (entry.value == '1' ? ' (checked)' : ' (unchecked)');

		} else {
			if(entry.meta.meta) {
				value = terafm.help.encodeHTMLEntities(entry.meta.meta) + ': ';
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

	restore(opts = {flash: false, clone: true}) {
		let editable = this.getEditable();
		if(editable) {
			editable.applyEntry(this);
			if(opts.flash) editable.flashHighlight();
		}
		if(opts.clone !== false && terafm.options.get('cloneOnRestore') === true) {
			this.sessionId = terafm.db.getGlobalSessionId();
			this.save();
		}
	}

	save() {
		terafm.db.saveEntry(this);
	}

	getSession() {
		return this.session;
	}

	hasEditable() {
		return !!this.getEditable();
	}

	getEditable() {
		if(this._editable !== undefined) {
			return this._editable;
		} else {
			this._editable = terafm.editables.get(this.path);
			return this._editable;
		}
	}

	delete(callback) {
		terafm.db.del(this.sessionId, this.editableId, callback);
	}
}