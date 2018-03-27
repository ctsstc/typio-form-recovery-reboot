window.terafm = window.terafm || {};

terafm.Session = class Session {
	constructor(entries, id) {
		this.id = id;
		this.entries = entries;
		this.initLength = this.length;
	}

	get length() {
		return Object.keys(this.entries).length;
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

	restore() {
		this.each((entry) => entry.restore());
	}

	getEntry(eid) {
		return this.entries.hasOwnProperty(eid) ? this.entries[eid] : null;
	}
	getFirst() {
		return this.entries[Object.keys(this.entries)[0]];
	}
}