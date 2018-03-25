window.terafm = window.terafm || {};
terafm.db = terafm.db || {};

(function(db) {
	'use strict';

	let storage = { inUse: {}, snapshot: {} };

	const domainId = '###' + window.location.hostname;

	// storage.inUse.field505372698 = {sess111: {something: 'some value'}, sess222: {something: 'some other value'}}
	// storage.inUse.dummyField = {sess111: {something: 'somsssddue'}, sess222: {something: 'somesdfue'}}

	// GET: All sessions, single session, single entry, specials (recent, latest)
	// SAVE: sessions in use
	// DEL: single entry?

	// SYNC: pergePush, fetch

	db.fetchSnapshot = fetchSnapshot;

	db.getAllSess = () => {
		// Fetch new snapshot, merge, return new SessionIterator()
	}
	db.getSess = (sid) => {
		// No need to fetch; will never request a specific session from the future
		// if(session is in use) return new Session() from in use
		// else if(session is in snapshot) return new Session() from snapshot
		return getFromBuckets(sid);
	}
	db.getEntry = (sid, eid) => {
		// Get sess, map by eid, return new Entry()
		return new terafm.Entry(db.getSess(sid).getEntry(eid));
	}
	db.getByEditable = (eid) => {
		return new terafm.EntryList(getEditableFromBucket('inUse', eid) || getEditableFromBucket('snapshot', eid));
	}


	function getFromBuckets(...args) {
		return getSessFromBucket('inUse', ...args) || getSessFromBucket('snapshot', ...args);
	}

	function getEditableFromBucket(bucketId, eid) {
		let bucket = getBucket(bucketId);
		if(bucket.hasOwnProperty(eid)) {
			return Object.assign({}, bucket[eid])
		}
	}

	function getSessFromBucket(bucketId, sid) {
		let tmp = {},
			bucket = copyBucket(bucketId);

		for(let eid in bucket) {
			if(bucket[eid].hasOwnProperty(sid)) {
				tmp[eid] = bucket[eid][sid]
			}
		}

		return Object.keys(tmp).length ? new terafm.Session(Object.assign({}, tmp), sid) : null;
	}

	function copyBucket(bucketId) {
		if(bucketId === 'inUse') {
			return Object.assign({}, storage.inUse);
		} else if(bucketId === 'snapshot') {
			if(storage.snapshot.hasOwnProperty(domainId)) {
				return Object.assign({}, storage.snapshot[domainId].fields);
			} else {
				return {};
			}
		}
	}

	function getBucket(bucketId) {
		if(bucketId === 'inUse') {
			return storage.inUse;
		} else if(bucketId === 'snapshot') {
			if(storage.snapshot.hasOwnProperty(domainId)) {
				return storage.snapshot[domainId].fields;
			} else {
				return {};
			}
		}
	}




	// chrome.storage.local.clear();


	db.init = function(callback) {
		// convertIndexedDB(); return;

		// convertIndexedDB().then(pushSnapshot);
		console.log(storage)
		// fetchSnapshot().then(() => {
		// 	randomInput('111');
		// 	// console.log(getMerged())
		// });
		
		// randomInput('111');
		// fetchMergePush().then(fetchSnapshot);

		fetchSnapshot().then(() => {

			// console.log(db.getSess('1521818363'))
			// console.log(db.getSess('1521816559'))
			// console.log(db.getEntry('1521570031', 'field-1712385224'))
			// var byed = db.getByEditable('field-1712385224')
			// console.log(byed.editable)
			// storage.snapshot[domainId].banana = 'hello yo!';
			// randomInput('bah');
			// pushSnapshot().then();
		})
	}

	function randomInput(id) {
		storage.inUse['dummy-' + id] = {sess111: {something: id}, sess222: {something: id}}
	}


	function getMerged() {
		var tmp = Object.assign({}, unwrap(storage.snapshot));
		for(let fid in storage.inUse) {
			if(fid in tmp) {
				tmp[fid] = {...tmp[fid], ...storage.inUse[fid]}
			} else {
				tmp[fid] = storage.inUse[fid]
			}
		}
		return tmp;
	}

	function fetchSnapshot() {
		return new Promise(done => {
			chrome.storage.local.get(domainId, data => {
				storage.snapshot = data;//isWrapped(data) ? data : wrap({});
				done();
			})
		});
	}

	function pushSnapshot() {
		return new Promise(done => {
			chrome.storage.local.set(storage.snapshot, done);
		})
	}

	// Fetch, merge, push
	function fetchMergePush() {
		return new Promise(done => {
			fetchSnapshot().then(() => {
				// Todo: Check if snapshot[domainId].fields exists first??
				storage.snapshot[domainId].fields = getMerged();
				chrome.storage.local.set(storage.snapshot, done);
			});
		})
	}

	function isWrapped(data) {
		return (typeof data === 'object' && domainId in data && 'fields' in data[domainId]) ? true : false;
	}
	function wrap(data) {
		if(!isWrapped(data)) return { [domainId] : { fields: data } };
		else throw new Error('Cant rap twice yo');
	}
	function unwrap(data) {
		return isWrapped(data) ? data[domainId].fields : {};
	}


	// Get data from indexeddb
	function convertIndexedDB() {
		return new Promise(done => {
			getIndexedDBData().then((data) => {
				data = wrap(data);
				storage.snapshot = data;
				chrome.storage.local.set(data, done);
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