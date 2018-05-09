window.terafm = window.terafm || {};
terafm.placeholders = {};

(function(placeholders) {

	let entries = new terafm.EntryList();

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
	
})(terafm.placeholders);