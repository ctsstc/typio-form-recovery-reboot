window.terafm = window.terafm || {};


(function() {

	var storage = {};
	var sessionId = Math.round(new Date().getTime()/1000);


	// Writes in memory storage to disk (IndexedDB or localStorage)
	function sync() {
		terafm.indexedDB.save(JSON.stringify(storage), function() {
			console.log('synced')
		});
	}

	// Loads disk storage to in-memory
	function loadStorageFromDisk(callback) {
		terafm.indexedDB.load(function(res) {
			if(res) {
				storage = JSON.parse(res);
				console.log('loaded from indexedDB');
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

				storage[inputId] = JSON.parse(localStorage.getItem(item));
				found = true;

				console.log('restored', item, 'into', inputId)
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
				//convertLegacyStorage();
				loadStorageFromDisk(callback);
			});
		},

		sessionId: function() {
			return sessionId;
		},

		sync: function(){
			sync();
		},

		saveRevision: function(inputPath, obj) {
			var hashedPath = terafm.helpers.generateInputId(inputPath);
			if(!(hashedPath in storage)) {
				storage[hashedPath] = {}
			}
			storage[hashedPath][sessionId] = obj;
			sync();
		},

		getAllRevisions: function() {
			return terafm.helpers.cloneObject(storage);
		},

		getRevisionsByInput: function(inputPath) {
			var hashedPath = terafm.helpers.generateInputId(inputPath);
			return terafm.helpers.cloneObject(storage[hashedPath] || {})
		},

		getRevisionsBySession: function(timestamp) {
			var entries = [];
			for(input in storage) {
				if(timestamp in storage[input]) {
					entries.push(storage[input][timestamp]);
				}
			}

			return terafm.helpers.cloneObject(entries || {});
		},

		deleteAllRevisionsByInput: function(inputPath) {

			var hashedPath = terafm.helpers.generateInputId(inputPath),
				tmpCurr = storage[hashedPath][sessionId];

			delete storage[hashedPath];

			// Restore only current, if there is one
			if(tmpCurr !== undefined) {
				storage[hashedPath] = {};
				storage[hashedPath][sessionId] = tmpCurr;
			}
			sync();
		},

		deleteSingleRevisionByInput: function(inputPath, session) {
			var inputId = terafm.helpers.generateInputId(inputPath),
				session = session || sessionId;

			return terafm.db.deleteSingleRevisionByInputId(inputId, session);
			sync();
		},

		deleteSingleRevisionByInputId: function(inputId, session) {

			// Check if input exists in storage
			if( storage[inputId] ) {
				delete storage[inputId][session];

				// If this was the only revision, just delete the whole storage item
				if( Object.keys(storage[inputId]).length < 1 ) {
					delete storage[inputId]
				}
			}
			sync();
		}

	};

})();