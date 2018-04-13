window.terafm = window.terafm || {};

terafm.EntryList = class EntryList {
	constructor() {
		this.entries = [];
	}

	get length() {
		return this.entries.length;
	}

	push(entry) {
		if(!(entry instanceof terafm.Entry)) return false;
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
}