window.terafm = window.terafm || {};

terafm.EntryList = class EntryList {
	constructor(entries) {
		this.entries = entries;
	}

	get editable() {
		return this.first().editable;
	}

	first() {
		return new terafm.Entry(this.entries[Object.keys(this.entries)[0]]);
	}
}