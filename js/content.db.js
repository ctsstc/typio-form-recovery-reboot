window.terafm = window.terafm || {};


(function() {

	var db = {};

	db.storage = {};
	db.sessionId = Math.round(new Date().getTime()/1000);
	db.initiated = false;


	// Writes in memory storage to disk (IndexedDB or localStorage)
	function sync() {
		terafm.indexedDB.save(JSON.stringify(db.storage));
	}

	// Loads disk storage to in-memory
	function loadStorageFromDisk(callback) {
		terafm.indexedDB.load(function(res) {
			if(res) {
				db.storage = JSON.parse(res);
			}

			callback();
		});
	}


	// This should only run once per domain, after the extension has been updated
	// Copies localStorage to in memory, then writes to IndexedDB.
	function convertLegacyStorage() {
		var found = false;

		for(item in localStorage) {
			if(item.indexOf('teraField') === 0) {
				var inputId = item.replace('teraField', 'field');

				db.storage[inputId] = JSON.parse(localStorage.getItem(item));
				localStorage.removeItem(item);
				found = true;
			}
		}

		if(found) {
			sync();
		}
	}



	// Public facing methods
	window.terafm.db = {

		init: function(callback) {
			// Initiate connected and load disk storage to in memory
			terafm.indexedDB.init(function() {
				convertLegacyStorage();
				loadStorageFromDisk(callback);
				db.initiated = true;
			});
		},

		initiated: function() {
			return db.initiated ? true : false;
		},

		sessionId: function() {
			return db.sessionId;
		},

		sync: function(){
			sync();
		},

		saveRevision: function(editableId, obj) {
			if(!(editableId in db.storage)) {
				db.storage[editableId] = {}
			}
			db.storage[editableId][db.sessionId] = obj;
			sync();
		},

		getAllRevisions: function() {
			return terafm.helpers.cloneObject(db.storage);
		},

		getAllRevisionsGroupedBySession: function() {

			var sessions = {};

			for(editableId in db.storage) {
				for(sessionId in db.storage[editableId]) {
					if(sessions[sessionId] === undefined) {
						sessions[sessionId] = {};
					}
					sessions[sessionId][editableId] = db.storage[editableId][sessionId];
				}
			}

			return terafm.helpers.cloneObject(sessions);

		},

		getRevisionsByEditable: function(editableId) {
			return terafm.helpers.cloneObject(db.storage[editableId] || {})
		},

		getSingleRevisionByEditableAndSession: function(editableId, session) {
			if(db.storage[editableId]) {
				return terafm.helpers.cloneObject(db.storage[editableId][session] || {});
			}
		},

		getRevisionsBySession: function(session) {
			var revisions = [];

			for(editable in db.storage) {
				if(session in db.storage[editable]) {
					revisions.push(db.storage[editable][session]);
				}
			}

			return terafm.helpers.cloneObject(revisions || {});
		},

		// Deletes everythinng except for current session
		deleteAllSessions: function() {
			for(editable in db.storage) {
				var curr = db.storage[editable][db.sessionId];

				delete db.storage[editable];

				if(curr) {
					db.storage[editable] = {};
					db.storage[editable][db.sessionId] = curr;
				}
			}

			sync();
		},

		deleteSingleRevisionByEditable: function(editableId, session) {

			// Check if input exists in storage
			if( db.storage[editableId] ) {
				delete db.storage[editableId][session];

				// If this was the only revision, just delete the whole storage item
				if( Object.keys(db.storage[editableId]).length < 1 ) {
					delete db.storage[editableId]
				}
			}
			sync();
		}

	};

})();