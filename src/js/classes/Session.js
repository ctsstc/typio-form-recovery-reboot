import Helpers from '../modules/Helpers';
import Entry from './Entry';
import EditableList from './EditableList';

export default class Session {
	constructor(id) {
		this.id = id;
		this.entries = {};
	}

	get length() {
		return Object.keys(this.entries).length;
	}

	getEditables() {
		return new EditableList(this);
	}

	contains(eid) {
		return this.entries.hasOwnProperty(eid);
	}

	push(entry) {
		if(!(entry instanceof Entry)) throw new Error('Push requires an Entry to push.')
		this.entries[entry.editableId] = entry;
	}

	deleteAll(callback) {
		const toDelete = [];
		for(let eid in this.entries) {
			toDelete.push([this.id, eid]);
		}
		db.delMultiple(toDelete, callback);
	}

	each(fn) {
		for(let eid in this.entries) {
			let tmp = fn(this.entries[eid], this.id, eid);
			if(tmp === false) break;
			else if(tmp === null) delete this.entries[eid];
			else if(tmp !== undefined) this.entries[eid] =tmp;
		}
		return this;
	}

	// Only keep entry if fn returns true
	filter(fn) {
		for(let eid in this.entries) {
			if(fn(this.entries[eid]) !== true) {
				delete this.entries[eid];
			}
		}
	}

	getFirstEntry() {
		for(const eid in this.entries) {
			return this.entries[eid];
		}
	}

	prettyDate() {
		return Helpers.prettyDateFromTimestamp(this.id);
	}

	setPlaceholders() {
		this.each((entry) => entry.setPlaceholder());
	}

	restore(opts) {
		this.each((entry) => entry.restore(opts));
	}

	getEntryByEditable(eid) {
		return this.entries.hasOwnProperty(eid) ? this.entries[eid] : null;
	}
}