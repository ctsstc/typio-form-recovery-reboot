import EntryList from '../classes/EntryList';

let placeholders = {};
let entries = new EntryList();

placeholders.snapshot = (data) => snapshot(data);
placeholders.restore = () => restore();

function snapshot(data) {
	entries.set(data);
}

function restore() {
	entries.each(entry => {
		entry.getEditable().remHighlight();
		entry.restore({clone: false});
	}).clear();
}

export default placeholders;