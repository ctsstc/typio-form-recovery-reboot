window.terafm = window.terafm || {};

terafm.EntryList = class EntryList {
	constructor(opts = {uniqueEditables: false}) {
		this.entries = [];
		
		this.uniqueEditables = opts.uniqueEditables;
		
		if(opts.uniqueEditables) {
			this.indexes = {};
		}
	}

	get length() { return this.entries.length; }

	update(data) {
		this.set(data, {override: true});
	}
	set(data, opts={override: false}) {

		// Sessions and entries will use supplied entry with static value
		// Editables will always create a new entry with current value

		if(data instanceof terafm.Entry) {
			let entry = data;

			if(this.uniqueEditables) {
				let i = this.containsEditable(entry);

				if(i === false) {
					this.indexes[entry.editableId] = this.entries.push(entry);

				} else if(opts.override) {
					this.entries[i] = entry;
				}

			// Don't care about dupes or indexing
			} else {
				// console.log('saving', entry.getEditable().el, [entry.obj.value]);
				this.entries.push(entry);
			}


		} else if(data instanceof terafm.Session) {
			data.each(entry => this.set(entry, opts));

		} else if(data instanceof terafm.EditableList) {
			for(let eid in data.editables) {
				this.set(data.editables[eid], opts);
			}

		} else if(data instanceof terafm.Editable) {
			if(this.uniqueEditables) {
				if(this.containsRadio(data)) {
					return false;
				}
			}

			let entry = data.getEntry({resolveUncheckedRadios: true});
			this.set(entry, opts);

		} else {
			throw new Error('EntryList cannot convert supplied data type');
		}
	}

	containsRadio(editable) {
		if(editable.el.type !== 'radio') return false;

		for(let entry of this.entries) {
			if(entry._editable.el.name === editable.el.name) {
				if(entry._editable.el.rootNode === editable.el.rootNode) {
					return true;
				}
			}
		}
		return false;
	}

	// Alias for set()
	push(data) {
		return this.set(data)
	}

	filter(fn) {
		for(let eid in this.entries) {
			let res = fn(this.entries[eid]);
			if(res !== true) delete this.entries[eid];
			if(res === false) break;
		}
		return this;
	}

	clear() {
		this.entries = [];
		this.indexes = {};
	}


	applyEntries() {
		// console.log('applyEntries', this.entries, this.indexes)
		for(let entry of this.entries) entry.restore();
		return this;
	}

	each(fn) {
		for(let ed of this.entries) fn(ed);
		return this;
	}

	containsEditable(checkEntry) {
		if(!this.uniqueEditables) throw new Error('Cannot check uniqueness for non-unique EntryList');
		return this.indexes.hasOwnProperty(checkEntry.editableId) ? this.indexes[checkEntry.editableId] : false;
	}
}