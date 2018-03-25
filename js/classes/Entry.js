window.terafm = window.terafm || {};

(function() {

	terafm.Session = class Session {
		constructor(editables, id) {
			this.id = id;
			this.editables = editables;
		}

		getEntry(eid) {
			return this.editables.hasOwnProperty(eid) ? this.editables[eid] : null;
		}
	}

	terafm.Entry = class Entry {
		constructor(obj) {

			// Make Entry from editable
			if(obj instanceof terafm.Editable) {
				this._editable = obj;
				this.value = obj.getValue()
				this.path = obj.getPath()
				this.type = obj.getType()
				this.meta = obj.getMeta()


			// Cast entry object
			} else {
				Object.assign(this, obj);
				this._editable = null;
			}
		}

		get obj() {
			return {
				value: this.value,
				path: this.path,
				type: this.type,
				meta: this.meta
			}
		}

		get editable() {
			return this._editable;
		}
	}

})();