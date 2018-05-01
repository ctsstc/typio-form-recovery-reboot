window.terafm = window.terafm || {};

terafm.Entry = class Entry {
	constructor(arg) {
		this.obj = {};

		// Make Entry from editable
		if(arg instanceof terafm.Editable) {
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

	getValue(opts = {encode: false, plaintext: false, truncate: false, trim: false}) {

		var str = this.obj.value;

		if(opts.encode) {
			str = terafm.help.encodeHTMLEntities(terafm.help.stripTags(str)).trim();
		
		} else if(opts.plaintext) {
			str = terafm.help.stripTags(str).trim();
		}

		if(Number.isInteger(opts.truncate)) {
			str = str.substring(0, opts.truncate) + '...';
		}

		if(opts.trim) {
			str = terafm.help.trim(str);
		}

		return str;
	}

	setPlaceholder() {
		let editable = this.getEditable();
		if(editable) {
			editable.applyPlaceholderEntry(this);
		}
	}

	restore() {
		let editable = this.getEditable();
		if(editable) {
			editable.applyEntry(this);
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
		if(this._editable) {
			return this._editable;
		} else {
			return this._editable = terafm.EditableFactory(this.obj.path);
		}
	}

	delete() {
		terafm.db.del(this.sessionId, this.editableId);
	}
}