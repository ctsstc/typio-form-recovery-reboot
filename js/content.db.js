window.terafm = window.terafm || {};


(function() {

	var storage = {};
	var sessionId = Math.round(new Date().getTime()/1000);


	// Writes in memory storage to disk (IndexedDB or localStorage)
	function sync() {
		localStorage.setItem('teraStorage', JSON.stringify(storage));
	}

	// Loads disk storage to in-memory
	function loadStorageFromDisk() {
		storage = JSON.parse(localStorage.getItem('teraStorage')) || {};
	}

	// TEMPORARY BOTH LINES
	loadStorageFromDisk();
	setInterval(sync, 1000);



	// Public facing methods
	window.terafm.db = {

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
		},

		getRevisionsByInput: function(inputPath) {
			var hashedPath = terafm.helpers.generateInputId(inputPath);
			return JSON.parse(JSON.stringify(storage[hashedPath] || {}))
		},

		getRevisionsBySession: function(timestamp) {
			var entries = [];
			for(input in storage) {
				if(timestamp in storage[input]) {
					entries.push(storage[input][timestamp]);
				}
			}

			return JSON.parse(JSON.stringify(entries));
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
		},

		deleteSingleRevisionByInput: function(inputPath, session) {
			var hashedPath = terafm.helpers.generateInputId(inputPath),
				session = session || sessionId;

			// Check if input exists in storage
			if( storage[hashedPath] ) {
				delete storage[hashedPath][session];

				// If this was the only revision, just delete the whole storage item
				if( Object.keys(storage[hashedPath]).length < 1 ) {
					delete storage[hashedPath]
				}
			}
		}

	};

})();