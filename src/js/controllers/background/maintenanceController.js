import defaultOptions from '../../modules/options/defaultOptions';

// chrome.idle.setDetectionInterval(15); // seconds
chrome.idle.setDetectionInterval(60); // seconds
chrome.idle.onStateChanged.addListener(function(state) {
	if(state === 'idle') {
		chrome.storage.local.get('DBMaintenanceTimestamp', function(res) {
			let lastrun = res.DBMaintenanceTimestamp || 0;

			if(Date.now() - lastrun > 43200000) { // 12 hours
				console.log('Is idle, running maintenance')
				runMaintenance();
				chrome.storage.local.set({ DBMaintenanceTimestamp: Date.now() });
			} else {
				console.log('Is idle but maintenance has already been ran.')
			}
		})
	}
});

function runMaintenance() {

	chrome.storage.sync.get('storageTimeDays', function(data) {
		let maxdays = data.hasOwnProperty('storageTimeDays') ? data['storageTimeDays'] : defaultOptions.get('storageTimeDays');
		let expirepoint = (Date.now()/1000) - (maxdays * 86400);

		// Delete old stuff
		chrome.storage.local.get(null, function(data) {

			// Loop through all domains in storage

			for(let domain in data) {
				if(domain.indexOf('###') !== 0 || !data[domain].hasOwnProperty('fields')) continue;
				let action = 'ignore';

				// console.log('data for', domain, JSON.parse(JSON.stringify(data[domain])))

				// If empty domain (nothing stored in domain)
				if(Object.keys(data[domain].fields) < 1) {
					action = 'delete';

				} else {
					for(let fieldId in data[domain].fields) {

						// Loop through every session id per field
						for(let sessionId in data[domain].fields[fieldId].sess) {
							if(sessionId < expirepoint) {

								// console.log(sessionId, data[domain].fields[fieldId].sess[sessionId])

								// Delete entry
								delete data[domain].fields[fieldId].sess[sessionId];

								// Delete entire field if empty
								if(Object.keys(data[domain].fields[fieldId].sess).length < 1) {
									delete data[domain].fields[fieldId]
								}

								action = 'save';

								// Delete entire field if empty
								if(Object.keys(data[domain].fields).length < 1) {
									action = 'delete';
								}
							}

						}
					}
				}

				// Write changes
				if(action === 'save') {
					console.log('maintenance run on', domain/*, JSON.parse(JSON.stringify(data[domain]))*/);
					chrome.storage.local.set({[domain]: data[domain]});

				} else if(action === 'delete') {
					console.log('maintenance deleted', domain)
					chrome.storage.local.remove(domain);
				}
			}

		});
	});
}
