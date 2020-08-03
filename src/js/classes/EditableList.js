import Session from './Session';
import Editable from './Editable';


export default class EditableList {
	constructor(session) {
		this.clear();
		if(session instanceof Session) {
			this.set(session);
		}
	}

	get length() { return this.editables.length; }

	contains(checkEditable) {
		return Object.keys(this.editables).indexOf(checkEditable.id) !== -1;
	}

	push(editable) {
		if(!(editable instanceof Editable)) return;
		// if(this.contains(editable)) return; // skip for performance
		this.editables[editable.id] = editable;
	}
	set(data) {
		if(data instanceof Session) {
			this.clear();
			data.each(entry => this.push(entry.getEditable()))
		} else {
			throw new Error('EditableList cannot convert supplied data type');
		}
	}

	delete(editable) {
		if(editable.id) delete this.editables[editable.id];
	}

	clear() {
		this.editables = {};
	}



	filter(fn) {
		for(let eid in this.editables) {
			let res = fn(this.editables[eid]);
			if(res !== true) delete this.editables[eid];
			if(res === false) break;
		}
		return this;
	}
}
