window.terafm = window.terafm || {};
terafm.db = {};

(function(db, options, help) {
	'use strict';

	let container = {};
	let initiated = false;

	let globalSessionId;

	globalSessionId = generateSessionId();



	function generateSessionId() {
		return Math.round(new Date().getTime()/1000);
	}


	// Writes in memory storage to disk (IndexedDB or localStorage)
	function sync() {
		terafm.indexedDB.save(JSON.stringify(container));
	}

	// Loads disk storage to in-memory
	function loadStorageFromDisk(callback) {
		terafm.indexedDB.load(function(res) {
			if(res) {
				container = JSON.parse(res);
			}

			callback();
		});
	}


	// This should only run once per domain, after the extension has been updated
	// Copies localStorage to in memory, then writes to IndexedDB.
	// Todo: Also convert old frame path into new concat format
	function convertLegacyStorage() {
		var found = false;

		for(let item in localStorage) {
			if(item.indexOf('teraField') === 0) {
				var inputId = item.replace('teraField', 'field');

				container[inputId] = JSON.parse(localStorage.getItem(item));
				localStorage.removeItem(item);
				found = true;
			}
		}

		if(found) {
			sync();
		}
	}

	function deleteExpiredSessions() {
		// Todo: Fix
		return;

		console.log(options);

		var editables = terafm.db.getAllRevisions(),
			//                    Now           -           Seconds to store                 = past point in time when everything earlier is expired
			expirePoint = terafm.db.globalSessionId() - (options.get('storageTimeDays') * 86400); // 86400 = 24h

		for (editableId in editables) {
			for(session in editables[editableId]) {

				// Expired
				if(session < expirePoint) {
					terafm.db.deleteSingleRevisionByEditable(editableId, session);
				}
			}
		}
	}


	// Public facing methods

	db.init = function(callback) {

		if(initiated) {
			callback();
			return true;
		}

		// Initiate connected and load disk storage to in memory
		terafm.indexedDB.init(function() {
			convertLegacyStorage();
			loadStorageFromDisk(function() {
				deleteExpiredSessions();
				callback();
				initiated = true;
			});
		});
	}

	db.initiated = function() {
		return initiated ? true : false;
	}

	db.sessionId = function() {
		return globalSessionId;
	}

	db.sync = function(){
		sync();
	}

	db.generateSessionId = () => generateSessionId();

	db.saveRevision = function(editableId, obj, editableSessId) {
		if(!(editableId in container)) {
			container[editableId] = {}
		}
		container[editableId][editableSessId || globalSessionId] = obj;
		sync();
	}

	db.getAllRevisions = function() {
		return help.cloneObject(container);
	}

	db.getAllRevisionsGroupedBySession = function() {

		var sessions = {};

		for(var editableId in container) {
			for(var globalSessionId in container[editableId]) {
				if(sessions[globalSessionId] === undefined) {
					sessions[globalSessionId] = {};
				}
				sessions[globalSessionId][editableId] = container[editableId][globalSessionId];
			}
		}

		return help.cloneObject(sessions);

	}

	db.getLatestSession = function() {
		var sessions = terafm.db.getAllRevisionsGroupedBySession();

		// Exclude current if it exists
		delete sessions[globalSessionId];

		var keys = Object.keys(sessions);

		if(keys.length < 1) return false;

		var last = keys.reduce(function(a, b) {
			return Math.max(a, b);
		});

		return sessions[last];
	}

	db.getRevisionsByEditable = function(editableId) {
		return help.cloneObject(container[editableId] || {})
	}

	db.getSingleRevisionByEditableAndSession = function(editableId, session) {
		if(container[editableId]) {
			return help.cloneObject(container[editableId][session] || {});
		}
	}

	db.getRevisionsBySession = function(session) {
		var revisions = [];

		for(var editable in container) {
			if(session in container[editable]) {
				revisions.push(container[editable][session]);
			}
		}

		return help.cloneObject(revisions || {});
	}

	// Deletes everythinng except for current session
	db.deleteAllSessions = function() {
		for(var editable in container) {
			var curr = container[editable][globalSessionId];

			delete container[editable];

			if(curr) {
				container[editable] = {};
				container[editable][globalSessionId] = curr;
			}
		}

		sync();
	}

	db.deleteSingleRevisionByEditable = function(editableId, session) {

		// Check if input exists in storage
		if( container[editableId] ) {
			delete container[editableId][session || globalSessionId];

			// If this was the only revision, just delete the whole storage item
			if( Object.keys(container[editableId]).length < 1 ) {
				delete container[editableId]
			}
		}
		sync();
	}

	db.getRecentRevisions = function(excludeId, max) {
		var revisions = terafm.db.getAllRevisionsGroupedBySession(),
			max = max || 10,
			matches = {};

		var revKeys = Object.keys(revisions).reverse();


		for(var revKey in revKeys) {
			for(var entryId in revisions[revKeys[revKey]]) {
				if(max < 1) break;
				if(entryId === excludeId) continue;

				var entry = revisions[revKeys[revKey]][entryId];

				if(entry.value.length > 4) {
					matches[ revKeys[revKey] ] = entry;
					max--;
				}
			}
		}

		return matches;
	}


	db.getEntriesByText = function(search, max) {
		var search = '' + search;
		search = search.trim();
		search = escapeRegExp(search);
		search = new RegExp(search, 'i');

		var fields = terafm.db.getAllRevisions(),
			matches = {},
			max = max || 10;

		for(fieldId in fields) {
			for(entryId in fields[fieldId]) {
				if(max < 1) break;

				var entry = fields[fieldId][entryId];


				if( search.test(entry.value) === true ) {
					matches[entryId] = entry;
					max--;
				}
			}
		}

		return matches;

	}


})(terafm.db, terafm.options, terafm.help);