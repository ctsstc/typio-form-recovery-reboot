window.terafm = window.terafm || {};

(function() {

	var db,
		init = false;

	window.terafm.indexedDB = {

		save: function(data, callback) {

			if(!init) {
				throw new Error('Typio: Cannot save before IndexedDB has been initialized.');
				return false;
			}

			var transaction = prepareTransaction(callback);

			var objectStore = transaction.objectStore("storage"),
				updateRequest = objectStore.put(data, 'inputs');

			updateRequest.onerror = function() {
				console.error('Typio Form Recovery: Could not save to database.');
			}
		},

		load: function(callback) {

			var transaction = prepareTransaction();

			var objectStore = transaction.objectStore("storage"),
				request = objectStore.get('inputs');

			request.onsuccess = function(e) {
				callback(e.target.result);
			}

		},

		init: function(callback) {
			if(init) {
				callback();
				return true;
			}

			var request = window.indexedDB.open("terafmStorage", 1);

			request.onsuccess = function(event) {
				db = request.result;
				init = true;
				callback();
			};

			request.onerror = function(event) {
				console.error('Typio Form Recovery: Could not initiate database.');
			}

			request.onupgradeneeded = function(event) {
				event.target.result.createObjectStore("storage");
			};
		}

	}

	function prepareTransaction(callback) {
		if(db) {
			var transaction = db.transaction(["storage"], "readwrite");

			transaction.oncomplete = callback;

			transaction.onerror = function(event) {
				console.error('Typio Form Recovery: Could not create database transaction.');
			};
			
			return transaction;
		}
	}

})();
