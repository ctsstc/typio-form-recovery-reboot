window.terafm = window.terafm || {};
terafm.db = terafm.db || {};
terafm.db.legacy = {};

(function(db, legacy) {
	'use strict';

	legacy.convert = function() {
		if(shouldConvertLegacyStorage()) {
			setStorageVersion();

			convertLegacyStorage();
		}
	}

	function shouldConvertLegacyStorage() {
		let ver = localStorage.getItem('terafmDbVersion');

		if(ver != db.version) {
			return true;
		}
		return false;
	}

	function setStorageVersion() {
		localStorage.setItem('terafmDbVersion', db.version);
	}

	function convertLegacyStorage() {

		let syncAfter = false,
			container = db.getContainer();

		// Prepend old "frame" value to path value
		for(let editableId in container) {
			let setNewId = false;

			for(let sessId in container[editableId]) {
				let entry = container[editableId][sessId];

				if(entry.frame) {
					entry.path = entry.frame + ' > ' + entry.path;
					delete entry.frame;

					setNewId = terafm.editableManager.generateEditableId(entry.path);

					container[editableId][sessId] = entry;
					syncAfter = true;
				}
			}

			// Set new editable id generated from updated path
			if(setNewId !== false) {
				container[setNewId] = container[editableId];
				delete container[editableId]
			}
		}

		if(syncAfter) {
			db.sync();
		}
	}

})(terafm.db, terafm.db.legacy);