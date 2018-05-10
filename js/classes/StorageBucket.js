window.terafm = window.terafm || {};

terafm.StorageBucket = class Bucket {
	constructor(domainId, setObj={}) {
		this.domainId = domainId;
		this.set(setObj)
	}

	get sessionIds() {
		return this._sessionIds !== undefined ? this._sessionIds : this._sessionIds = this.generateSessionIds();
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

	set(obj) {
		// if(!obj || Object.keys(obj) === 0) return;

		// Set context
		if(obj.hasOwnProperty(this.domainId)) {
			this.context = obj;
			this.fields = this.context[this.domainId].fields;

		// Set fields
		} else {
			// Update fields within context
			if(this.context !== undefined) {
				this.context[this.domainId].fields = obj;
				this.fields = this.context[this.domainId].fields;

			// Create context (first time)
			} else {
				this.context = {[this.domainId]: {fields: {} }};
				this.fields = this.context[this.domainId].fields;
			}
		}
	}

	generateSessionIds() {
		let ids = [];
		for(let fid in this.fields) {
			ids = ids.concat(Object.keys(this.fields[fid]));
		}
		return ids.sort();
	}

	setEntry(entry) {
		if(!(entry instanceof terafm.Entry)) throw new Error(`setEntry requires an actual entry, you goof!`);
		if(!this.fields.hasOwnProperty(entry.editableId)) {
			this.fields[entry.editableId] = { [entry.sessionId] : entry.obj };
		} else {
			this.fields[entry.editableId][entry.sessionId] = entry.obj;
		}
	}

	copy() {
		return JSON.parse(JSON.stringify(this));
	}

	getEntries(max=-1, excludeEid, filterFn) {
		let allsess = this.getSessions();
		let entrylist = new terafm.EntryList();

		allsess.each(sess => {
			sess.each(entry => {
				if(max !== undefined && max > 0) max--; else if(max !== undefined) return false;
				if(excludeEid && entry.editableId === excludeEid) return null;
				if(filterFn && filterFn(entry) === false) return false;
				entrylist.set(entry);
			})
			if(max !== undefined && max < 1) else if(max !== undefined) return false;
		});

		return entrylist;
	}

	getSessions(_sids=[], max=-1) {
		let sids = _sids && _sids.length ? _sids : this.sessionIds.reverse();
		let sesslist = new terafm.SessionList();

		for(let sid of sids) {
			let tmpsess = new terafm.Session(sid);

			for(let fid in this.fields) {
				if(this.fields[fid].hasOwnProperty(sid)) {
					tmpsess.push(new terafm.Entry({
						session: tmpsess,
						sessionId: sid,
						editableId: fid,
						obj: this.fields[fid][sid]
					}));
				}
			}

			if(tmpsess.length) {
				sesslist.push(tmpsess);
				if(max === 0) break; else max--;
			}
		}

		return sesslist;
	}
	
	getSessionsContainingEditable(eid, max) {
		if(this.fields.hasOwnProperty(eid) !== true) return new terafm.SessionList();
		const sids = Object.keys(this.fields[eid]);
		return this.getSessions(sids, max);
	}


	getSession(sid) {
		let sess = new terafm.Session(sid);

		for(let eid in this.fields) {
			if(this.fields[eid].hasOwnProperty(sid)) {
				sess.push(
					new terafm.Entry({
						session: sess,
						sessionId: sid,
						editableId: eid,
						obj: this.fields[eid][sid]
					})
				);
			}
		}

		return sess;
	}
	getEntry(sid, eid) {
		if(this.fields.hasOwnProperty(eid) && this.fields[eid].hasOwnProperty(sid)) {
			return new terafm.Entry({
				session: null,
				sessionId: sid,
				editableId: eid,
				obj: this.fields[eid][sid]
			});;
		}
	}
}