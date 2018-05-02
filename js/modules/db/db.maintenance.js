window.terafm = window.terafm || {};
terafm.db = terafm.db || {};
terafm.db.maintenance = {};

(function(db, maintenance, options) {
	'use strict';


	maintenance.run = function() {
		if(shouldRunMaintenance()) {
			setMaintenanceTimestamp();
			
			// Run maintenance functions
			deleteExpiredSessions();
		}
	}

	function setMaintenanceTimestamp() {
		localStorage.setItem('terafmMaintenanceStamp', Date.now());
	}

	function shouldRunMaintenance() {
		let lastRun = localStorage.getItem('terafmMaintenanceStamp');

		// If last run was over 12 hours ago
		if(Date.now() - lastRun > 43200000) {
			return true;
		}

		return false;
	}





	// Delete entries older than storageTimeDays setting
	function deleteExpiredSessions() {

		var editables = db.getAllRevisions(),
			// Now - Seconds to store = past point in time when everything earlier is expired
			expirePoint = (Date.now()/1000) - (options.get('storageTimeDays') * 86400); // 86400 = 24h secs

		for (let editableId in editables) {
			for(let sessionId in editables[editableId]) {

				// Expired
				if(sessionId < expirePoint) {
					terafm.db.deleteSingleRevisionByEditable(editableId, sessionId);
					// console.log(sessionId, ' < ', expirePoint, 'expired and deleted')
				} else {
					// console.log(sessionId-expirePoint, 'seconds left')
				}
			}
		}
	}


})(terafm.db, terafm.db.maintenance, terafm.options);