window.terafm = window.terafm || {};

terafm.StorageBucket = class Bucket {
	constructor(domainId, setObj={}) {
		this.domainId = domainId;
		this.set(setObj)
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

	getSessions(_sids=[], max=-1) {
		let tmp = {};

		fieldLoop:
		for(let eid in this.fields) {

			// If session ids are supplied
			if(_sids.length) {
				var ok = false;
				for(let sid of _sids) {
					if(this.fields[eid].hasOwnProperty(sid) === true) {ok = true; break;}
				}
				if(!ok) continue fieldLoop;
			}
			
			for(let sid in this.fields[eid]) {
				if(!tmp[sid]) tmp[sid] = new terafm.Session(sid);
				tmp[sid].push(new terafm.Entry({
					session: tmp[sid],
					sessionId: sid,
					editableId: eid,
					obj: this.fields[eid][sid]
				}))
			}

			max--; if(max===0) break fieldLoop;
		}

		// Make sessionlist
		let sesslist = new terafm.SessionList();
		for(let sid in tmp) {
			sesslist.push(tmp[sid]);
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