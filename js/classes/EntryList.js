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
}