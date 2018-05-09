window.terafm = window.terafm || {};
terafm.defaults = {};

(function(defaults) {

	let enabled;
	let entries = new terafm.EntryList({uniqueEditables: true});

	terafm.initHandler.onInit(() => {
		enabled = terafm.options.get('resetEditablesBetweenRestorations');
	});

	defaults.update = (data) => { if(enabled) update(data) }
	defaults.add = (data) => { if(enabled) add(data) }
	defaults.restore = () => { if(enabled) restore() }

	function update(data) {
		entries.update(data);
	}
	function add(data) {
		entries.set(data);
	}

	function restore() {
		entries.each(entry => entry.restore({clone: false}));
	}
	
})(terafm.defaults);