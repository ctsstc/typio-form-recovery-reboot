window.terafm = window.terafm || {};

terafm.db = (function(options, help) {
	'use strict';

	var container = {};
	var sessionId = Math.round(new Date().getTime()/1000);
	var initiated = false;

	var exp = {};


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
			// Now - Seconds to store = past point in time when everything earlier is expired
			expirePoint = terafm.db.sessionId() - (options.get('storageTimeDays') * 86400); // 86400 = 24h

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

	exp.init = function(callback) {

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

	exp.initiated = function() {
		return initiated ? true : false;
	}

	exp.sessionId = function() {
		return sessionId;
	}

	exp.sync = function(){
		sync();
	}

	exp.saveRevision = function(editableId, obj) {
		console.log('saving:', editableId, obj);
		if(!(editableId in container)) {
			container[editableId] = {}
		}
		container[editableId][sessionId] = obj;
		sync();
	}

	exp.getAllRevisions = function() {
		return help.cloneObject(container);
	}

	exp.getAllRevisionsGroupedBySession = function() {

		var sessions = {};

		for(var editableId in container) {
			for(var sessionId in container[editableId]) {
				if(sessions[sessionId] === undefined) {
					sessions[sessionId] = {};
				}
				sessions[sessionId][editableId] = container[editableId][sessionId];
			}
		}

		return help.cloneObject(sessions);

	}

	exp.getLatestSession = function() {
		var sessions = terafm.db.getAllRevisionsGroupedBySession();

		// Exclude current if it exists
		delete sessions[sessionId];

		var keys = Object.keys(sessions);

		if(keys.length < 1) return false;

		var last = keys.reduce(function(a, b) {
			return Math.max(a, b);
		});

		return sessions[last];
	}

	exp.getRevisionsByEditable = function(editableId) {
		return help.cloneObject(container[editableId] || {})
	}

	exp.getSingleRevisionByEditableAndSession = function(editableId, session) {
		if(container[editableId]) {
			return help.cloneObject(container[editableId][session] || {});
		}
	}

	exp.getRevisionsBySession = function(session) {
		var revisions = [];

		for(var editable in container) {
			if(session in container[editable]) {
				revisions.push(container[editable][session]);
			}
		}

		return help.cloneObject(revisions || {});
	}

	// Deletes everythinng except for current session
	exp.deleteAllSessions = function() {
		for(var editable in container) {
			var curr = container[editable][sessionId];

			delete container[editable];

			if(curr) {
				container[editable] = {};
				container[editable][sessionId] = curr;
			}
		}

		sync();
	}

	exp.deleteSingleRevisionByEditable = function(editableId, session) {

		session = session || sessionId;

		// Check if input exists in storage
		if( container[editableId] ) {
			delete container[editableId][session];

			// If this was the only revision, just delete the whole storage item
			if( Object.keys(container[editableId]).length < 1 ) {
				delete container[editableId]
			}
		}
		sync();
	}

	exp.getRecentRevisions = function(excludeId, max) {
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


	exp.getEntriesByText = function(search, max) {
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

	return exp;


})(terafm.options, terafm.help);