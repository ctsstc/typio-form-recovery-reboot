window.terafm = window.terafm || {};

terafm.Entry = class Entry {
	constructor(obj, sid, eid) {

		this.obj = {};

		// Make Entry from editable
		if(obj instanceof terafm.Editable) {
			this._editable = obj;
			this.editableId = this._editable.id;
			this.sessionId = this._editable.sessionId;

			this.obj.value = obj.getValue();
			this.obj.path = obj.path;
			this.obj.type = obj.type;
			
			var meta = obj.getMeta();
			if(meta) this.obj.meta = meta;


		// Cast entry object
		} else {
			Object.assign(this.obj, obj);
			this.editableId = eid;
			this.sessionId = sid;
		}
	}

	restore(highlight) {
		let editable = this.getEditable();
		if(editable) {
			editable.setEntry(this, highlight);
		}
	}

	save() {
		terafm.db.saveEntry(this);
	}

	getSession() {
		return this.session = terafm.db.getSession(this.sessionId);
	}

	getEditable() {
		if(this._editable) {
			return this._editable;
		} else {
			return this._editable = terafm.EditableFactory(this.obj.path);
		}
	}
}