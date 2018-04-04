window.terafm = window.terafm || {};

terafm.Session = class Session {
	constructor(id) {
		this.id = id;
		this.entries = {};
	}

	get length() {
		return Object.keys(this.entries).length;
	}

	push(entry) {
		if(!(entry instanceof terafm.Entry)) throw new Error('Push requires an Entry to push.')
		this.entries[entry.editableId] = entry;
	}

	each(fn) {
		for(let eid in this.entries) {
			fn(new terafm.Entry(this.entries[eid], this.id, eid));
		}
	}

	// Only keep entry if fn returns true
	filter(fn) {
		for(let eid in this.entries) {
			if(fn(new terafm.Entry(this.entries[eid], this.id, eid)) !== true) {
				delete this.entries[eid];
			}
		}
	}

	prettyDate() {
		return terafm.help.prettyDateFromTimestamp(this.id);
	}

	setPlaceholders() {
		this.each((entry) => entry.setPlaceholder());
	}

	restore() {
		this.each((entry) => entry.restore());
	}

	getEntryByEditable(eid) {
		return this.entries.hasOwnProperty(eid) ? this.entries[eid] : null;
	}
}