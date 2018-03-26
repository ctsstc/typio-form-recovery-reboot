window.terafm = window.terafm || {};
terafm.db = terafm.db || {};

(function(db) {
	'use strict';

	const domainId = '###' + window.location.hostname;
	let sessionId;

	class Bucket {
		constructor(obj) {
			this.set(obj)
		}

		// Dels onlt from inUse memory. For snapshot deletion make new method similar to push()
		del(sid, eid) {
			if(this.fields.hasOwnProperty(eid) && this.fields[eid].hasOwnProperty(sid)) {
				delete this.fields[eid][sid];
				if(Object.keys(this.fields[eid]).length === 0) {
					delete this.fields[eid];
				}
				console.log('found to delete!')
			}
		}

		set(obj = {}) {
			// Set context
			if(obj.hasOwnProperty(domainId)) {
				this.context = obj;
				this.fields = this.context[domainId].fields;

			// Set fields
			} else {
				// Update fields within context
				if(this.context !== undefined) {
					this.context[domainId].fields = obj;
					this.fields = this.context[domainId].fields;

				// Create context (first time)
				} else {
					this.context = {[domainId]: {fields: obj }};
					this.fields = this.context[domainId].fields;
				}
			}
		}
		setEntry(entry) {
			if(!(entry instanceof terafm.Entry)) throw new Error(`setEntry requires an actual entry, you goof!`);
			if(!this.fields.hasOwnProperty(entry.editableId)) {
				this.fields[entry.editableId] = { [entry.sessionId] : entry.obj };
			} else {
				this.fields[entry.editableId][entry.sessionId] = entry.obj;
			}
		}

		// Returns context with merged fields
		getMerged(toMerge) {
			if(!(toMerge instanceof Bucket)) throw new Error(`Merge requires a bucket to merge. That doesn't look like a bucket to me.`);
			
			var tmpContext = Object.assign({}, this.context),
				tmpFields = tmpContext[domainId].fields;

			for(let fid in toMerge.fields) {
				if(fid in tmpFields) {
					tmpFields[fid] = Object.assign({}, tmpFields[fid], toMerge.fields[fid]);
				} else {
					tmpFields[fid] = toMerge.fields[fid]
				}
			}

			return tmpContext;
		}

		getSessions() {
			var tmp = {};

			for(let eid in this.fields) {
				for(let sid in this.fields[eid]) {
					if(!tmp.hasOwnProperty(sid)) tmp[sid] = {};
					tmp[sid][eid] = new terafm.Entry(this.fields[eid][sid], sid, eid);
				}
			}

			return new terafm.SessionList(tmp);
		}
		getSession(sid) {
			var tmp = {};

			for(let eid in this.fields) {
				if(this.fields[eid].hasOwnProperty(sid)) {
					tmp[eid] = this.fields[eid][sid];
				}
			}

			return Object.keys(tmp).length ? new terafm.Session(tmp, sid) : null;
		}
		getEntry(sid, eid) {

			if(this.fields.hasOwnProperty(eid) && this.fields[eid].hasOwnProperty(sid)) {
				return new terafm.Entry(this.fields[eid][sid], sid, eid);
			}
		}
	}

	let buckets = {
		inUse: new Bucket(),
		snapshot: new Bucket()
	};
	buckets.applyOne = fn => fn(buckets.inUse) || fn(buckets.snapshot) || null;
	buckets.applyBoth = fn => {
		let res = [fn(buckets.inUse), fn(buckets.snapshot)];

		if(res[0] && res[1]) return res[0].merge(res[1])
		else if(res[0]) return res[0]
		else if(res[1]) return res[1]
	};

	// Will override context metadata if present. Make updateSnapshotFields() function if needed.
	function fetchSnapshot() {
		return new Promise(done => {
			chrome.storage.local.get(domainId, data => {
				buckets.snapshot.set(data);
				done();
			});
		});
	}


	// Fetch, merge, push
	function push() {
		return new Promise(done => {
			fetchSnapshot().then(() => {
				chrome.storage.local.set(buckets.snapshot.getMerged(buckets.inUse), () => {
					done();
				});
			});
		})
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
		return push();
	}
	db.getAllSessions = () => {
		return buckets.applyBoth(buck => buck.getSessions());
	}
	db.getSession = (sid) => {
		return buckets.applyOne(buck => buck.getSession(sid));
	}
	db.getEntry = (sid, eid) => {
		return buckets.applyOne(buck => buck.getEntry(sid, eid));
	}
	db.generateSessionId = function() {
		return Math.round(Date.now()/1000) + '';
	}
	db.saveEntry = (entry) => {
		buckets.inUse.setEntry(entry);
		debouncePush();
	}
	db.del = (...args) => {
		buckets.inUse.del(...args);
	}

	var debouncePush = terafm.help.throttle(push, 1000, {leading: false});





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
				data = new Bucket(data);
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