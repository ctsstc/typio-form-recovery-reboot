window.terafm = window.terafm || {};

terafm.Session = class Session {
	constructor(entries, id) {
		this.id = id;
		this.entries = entries;
	}

	restore() {
		for(let eid in this.entries) {
			new terafm.Entry(this.entries[eid], this.id, eid).restore();
		}
	}

	getEntry(eid) {
		return this.entries.hasOwnProperty(eid) ? this.entries[eid] : null;
	}
	getFirst() {
		return this.entries[Object.keys(this.entries)[0]];
	}
}