window.terafm = window.terafm || {};
terafm.db = terafm.db || {};

(function(db) {
	'use strict';

	const domainId = '###' + window.location.hostname;
	let sessionId;

	let buckets = {
		inUse: new terafm.StorageBucket(domainId),
		snapshot: new terafm.StorageBucket(domainId)
	};
	buckets.applyOne = fn => {
		let res = fn(buckets.inUse);
		if(res.length) return res;
		else return fn(buckets.snapshot)
	}
	buckets.applyBoth = fn => {
		let merged = mergeBuckets(buckets.inUse, buckets.snapshot);
		return fn(merged);
	};

	function mergeBuckets(b1, b2) {
		if(!(b1 instanceof terafm.StorageBucket) || !(b2 instanceof terafm.StorageBucket)) throw new Error(`Merge requires two buckets to merge.`);
		
		let b3 = new terafm.StorageBucket(domainId, b1.copy().context),
			[f2, f3] = [b2.fields, b3.fields];

		for(let eid in f2) {
			if(!f3.hasOwnProperty(eid)) {
				f3[eid] = f2[eid];
			} else {
				for(let sid in f2[eid]) {
					if(!f3[eid].hasOwnProperty(sid)) {
						f3[eid][sid] = f2[eid][sid];
					}
				}
			}
		}

		// b3.context[domainId].fields = f3;
		return b3;
	}


	// Will override context metadata if present. Make updateSnapshotFields() function if needed.
	function fetchSnapshot() {
		return new Promise(done => {
			chrome.storage.local.get(domainId, data => {
				buckets.snapshot.set(data);
				done();
			});
		});
	}

	function fetchAndMerge() {
		return new Promise(done => {
			fetchSnapshot().then(() => {
				let ts = mergeBuckets(buckets.inUse, buckets.snapshot);
				if(!ts.hasOwnProperty('context') || !ts.context.hasOwnProperty(domainId)) throw new Error('Attempted to write garbish to database. Careful!');
				done(ts);
			});
		})
	}

	function pushBucket(bucket) {
		return new Promise(done => {
			if(!(bucket instanceof terafm.StorageBucket) || !bucket.hasOwnProperty('context') || !bucket.context.hasOwnProperty(domainId)) throw new Error('Can not push non-buckets to database.');
			chrome.storage.local.set(bucket.context, () => {
				terafm.Events.trigger('db-save');
				done();
			});
		});
	}


	// Fetch, merge, push
	function sync() {
		console.log('sync');
		return fetchAndMerge().then(pushBucket);
	}


	db.init = function(done) {
		// chrome.storage.local.clear();return;
		console.log(buckets);
		sessionId = db.generateSessionId();
		fetchSnapshot().then(done);
	}
	db.getGlobalSessionId = () => sessionId;
	db.fetch = () => {
		return fetchSnapshot();
	}
	db.push = () => {
		return sync();
	}
	db.generateSessionId = function() {
		return Math.round(Date.now()/1000) + '';
	}
	db.saveEntry = (entry) => {
		buckets.inUse.setEntry(entry);
		debouncePush();
	}
	db.getSessions = (max) => {
		return buckets.applyBoth(buck => buck.getSessions()); // Todo: Make max arg work
	}
	db.getSession = (sid) => {
		return buckets.applyOne(buck => buck.getSession(sid));
	}
	db.getEntries = (max, excludeEid) => {
		return buckets.applyBoth(buck => buck.getEntries(max, excludeEid));
	}
	db.getSessionsContainingEditable = (eid, max) => {
		return buckets.applyBoth(buck => buck.getSessionsContainingEditable(eid, max));
	}
	db.getEntry = (...args) => {
		return buckets.applyOne(buck => buck.getEntry(...args));
	}
	db.del = (...args) => {
		fetchAndMerge().then(bucket => {
			buckets.inUse.del(...args);
			bucket.del(...args);
			pushBucket(bucket);
		});
	}

	var debouncePush = terafm.help.throttle(sync, 1000, {leading: false});





	function randomInput(id) {
		buckets.inUse.set({
			['dummyfield-' + id]: {
				sess111: {something: id},
				sess222: {something: id}
			}
		})
	}


	// Get data from indexeddb
	function convertIndexedDB() {
		return new Promise(done => {
			getIndexedDBData().then((data) => {
				data = new terafm.StorageBucket(domainId, data);
				// buckets.snapshot.set(data);
				chrome.storage.local.set(data.context, done);
			})
		})
	}
	function getIndexedDBData() {
		return new Promise(done => {
			terafm.indexedDB.init(() => {
				terafm.indexedDB.load(res => {
					done(JSON.parse(res) || {});
				})
			})
		})
	}

})(terafm.db);