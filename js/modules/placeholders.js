window.terafm = window.terafm || {};
terafm.placeholders = {};

(function(placeholders) {

	let entries = new terafm.EntryList();

	placeholders.snapshot = (data) => snapshot(data);
	placeholders.restore = () => restore();

	function snapshot(data) {
		console.log('snapshotting', data);
		entries.set(data);
	}

	function restore() {
		console.log('restoring and removing highlights');
		for(let entry of entries.entries) {
			entry.getEditable().remHighlight();
		}
		entries.applyEntries().clear();
	}
	
})(terafm.placeholders);