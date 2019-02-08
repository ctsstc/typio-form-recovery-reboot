/*
(async function() {

	// chrome.idle.setDetectionInterval(30); // seconds
	// chrome.idle.onStateChanged.addListener(function(state) {
	// 	if(state === 'idle') {
	// 		chrome.storage.local.get('DBStatsTimestamp', function(res) {
	// 			let lastrun = res.DBStatsTimestamp || 0;

	// 			if(Date.now() - lastrun > 7200000) { // 2 hours
	// 				console.log('Is idle, running db stats')
	// 				calcStats();
	// 				chrome.storage.local.set({ DBStatsTimestamp: Date.now() });
	// 			} else {
	// 				console.log('Is idle but db stats has already been ran.')
	// 			}
	// 		})
	// 	}
	// });

	calcStats();

	async function calcStats() {
		let db = await getDomains();
		let stats = [],
			totStats = {
				fields: 0,
				entries: 0,
				sessions: 0,
				domains: 0,
				bytesInUse: 0
			};

		for(let domid in db) {
			let dom = domid.replace('###', '');
			let tmp = {domain: dom, fields: 0, entries: 0, sessions: 0, bytesInUse: 0};

			let fields = db[domid].fields;

			tmp.fields = Object.keys(fields).length;

			let uniqueSids = [];
			for(let field in fields) {
				tmp.entries += Object.keys(fields[field].sess).length;
				uniqueSids = [...new Set([...uniqueSids, ...Object.keys(fields[field].sess)  ])];
			}
			tmp.sessions = uniqueSids.length;

			await getBytes(domid, bytes => tmp.bytesInUse = bytes);

			totStats.fields += tmp.fields;
			totStats.entries += tmp.entries;
			totStats.sessions += tmp.sessions;
			totStats.bytesInUse += tmp.bytesInUse;
			totStats.domains += 1;

			stats.push(tmp);
		}

		stats.sort((a, b) => a.entries < b.entries ? 1 : -1);
		// console.log(stats);
		// console.log(totStats);

		chrome.storage.local.set({dbDomainStats: stats});
		chrome.storage.local.set({dbTotStats: totStats});

		chrome.storage.local.get(['dbDomainStats', 'dbTotStats'], res => console.log(res));
	}

	async function getDomains() {
		return new Promise(function(done) {
			chrome.storage.local.get(null, storage => {
				let doms = Object.keys(storage);
				for(let dom of doms) {
					if(dom.indexOf('###') !== 0) {
						delete storage[dom];
					}
				}
				return done(storage);
			})
		});
	}


	async function getBytes(keyid, callback) {
		return new Promise(done => {
			chrome.storage.local.getBytesInUse(keyid, bytes => {
				callback(bytes);
				done();
			});
		});
	}

})();
*/