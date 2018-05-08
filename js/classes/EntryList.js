window.terafm = window.terafm || {};

terafm.EntryList = class EntryList {
	constructor() {
		this.entries = [];
	}

	get length() { return this.entries.length; }

	push(entry) {
		if(!(entry instanceof terafm.Entry)) return;
		// if(this.contains(entry)) return; // skip for performance
		this.entries.push(entry);
	}

	filter(fn) {
		for(let eid in this.entries) {
			let res = fn(this.entries[eid]);
			if(res !== true) delete this.entries[eid];
			if(res === false) break;
		}
		return this;
	}

	set(data) {
		if(data instanceof terafm.Session) {
			this.clear();
			data.each(entry => this.push(entry.copy()))
		} else if(data instanceof terafm.Entry) {
			this.clear();
			this.push(data.copy());
		} else if(data instanceof terafm.Editable) {
			this.clear();
			this.push(data.getEntry());
		} else {
			throw new Error('EntryList cannot convert supplied data type');
		}
	}

	clear() {
		this.entries = [];
	}


	applyEntries() {
		for(let entry of this.entries) entry.restore();
	}

	// contains(checkEntry) {
	// 	for(let entry of this.entries)
	// 		if(entry.editableId === checkEntry.editableId && entry.sessionId === checkEntry.sessionId)
	// 			return true;
	// }
}