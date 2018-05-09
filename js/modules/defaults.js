window.terafm = window.terafm || {};
terafm.defaults = {};

(function(defaults) {

	let entries = new terafm.EntryList({uniqueEditables: true});

	defaults.update = (data) => update(data);
	defaults.add = (data) => add(data);
	defaults.restore = () => restore();

	function update(data) {
		entries.update(data);
	}
	function add(data) {
		entries.set(data);
	}

	function restore() {
		entries.applyEntries();
	}
	
})(terafm.defaults);