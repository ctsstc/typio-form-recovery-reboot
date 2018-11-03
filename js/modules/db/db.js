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
				for(let sid in f2[eid].sess) {
					if(!f3[eid].sess.hasOwnProperty(sid)) {
						f3[eid].sess[sid] = f2[eid].sess[sid];
					}
				}
			}
		}

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
				// console.log('pushed bucket', bucket)
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
		convertIndexedDB().then(function() {
			console.log(buckets);
			sessionId = db.generateSessionId();
			fetchSnapshot().then(done);
		});
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
		return buckets.applyBoth(buck => buck.getSessions(false, max));
	}
	db.getSession = (sid) => {
		return buckets.applyOne(buck => buck.getSession(sid));
	}
	db.getEntries = (max, excludeEid, filterFn) => {
		return buckets.applyBoth(buck => buck.getEntries(max, excludeEid, filterFn));
	}
	db.getSessionsContainingEditable = (eid, max) => {
		return buckets.applyBoth(buck => buck.getSessionsContainingEditable(eid, max));
	}
	db.getEntry = (...args) => {
		return buckets.applyOne(buck => buck.getEntry(...args));
	}
	db.del = (sid, eid, callback) => {
		fetchAndMerge().then(mergeBuck => {
			buckets.inUse.del(sid, eid);
			mergeBuck.del(sid, eid);
			pushBucket(mergeBuck).then(fetchSnapshot).then(callback);
		});
	}

	var debouncePush = terafm.help.throttle(sync, 1000, {leading: false});




	// Get data from indexeddb
	function convertIndexedDB() {
		return new Promise(done => {
			getIndexedDBData().then((data) => {
				if(!data || Object.keys(data).length < 1) return done();

				let newd = {};
				for(let fid in data) {
					for(let sid in data[fid]) {

						// Clone first data to meta prop, exclude value
						if(!newd.hasOwnProperty(fid)) {
							newd[fid] = { sess: {}, meta: {}};
							newd[fid].meta = JSON.parse(JSON.stringify(data[fid][sid]));
							delete newd[fid].meta.value;
						}

						// Sometimes values are undefined in old storage
						if(data[fid][sid].value !== undefined) {
							newd[fid].sess[sid] = { value: data[fid][sid].value }
						}
					}
					if(Object.keys(newd[fid].sess).length < 1) delete newd[fid];
				}
				console.log('converted into new object:', newd);

				let bucket = new terafm.StorageBucket(domainId);
				bucket.setFieldObj(newd);
				console.log('new bucket:', bucket)
				chrome.storage.local.set(bucket.context, done);
				console.log('finito!');
			})
		})
	}

	function getIndexedDBData() {
		return new Promise(done => {
			terafm.indexedDB.init((exists) => {
				console.log('exists:', exists)
				if(exists === true) {

					terafm.indexedDB.load(res => {
						if(res === false) return done(false);
						console.log('object store exists, data fetched, importing...')
						let json = false;
						try {
							json = JSON.parse(res);
						} catch(e) {}

						terafm.indexedDB.destroy();
						done(json);
					})
				} else {
					console.log('no db, continuing as usual')
					done(false);
				}
			})
		})
	}

})(terafm.db);