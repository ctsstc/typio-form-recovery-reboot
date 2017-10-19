window.terafm = window.terafm || {};

(function() {

	var db,
		init = false;

	window.terafm.indexedDB = {

		save: function(data, callback) {

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
			var request = window.indexedDB.open("terafmStorage", 1);

			request.onsuccess = function(event) {
				db = request.result;
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
