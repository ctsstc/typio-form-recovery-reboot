window.terafm = window.terafm || {};

terafm.SessionList = class SessionList {
	constructor(obj={}) {
		this.sessions = obj;
	}

	get length() {
		return Object.keys(this.sessions).length;
	}

	index(i) {
		return this.sessions[Object.keys(this.sessions)[i]];
	}

	each(fn) {
		const sids = Object.keys(this.sessions).reverse();
		for(let sid of sids) {
			if(fn(this.sessions[sid], sid) === false) break;
		}
	}

	contains(sid) {
		return this.sessions && this.sessions.hasOwnProperty(sid);
	}

	push(session) {
		if(!(session instanceof terafm.Session)) throw new Error('SessionList only accepts Sessions.')
		this.sessions[session.id] = session;
	}

	pushTo(sid, entry) {
		if(!(entry instanceof terafm.Entry)) throw new Error('pushTo only accepts Entries.')

		if(!this.contains(sid)) this.addSession(sid);

		this.sessions[sid].push(entry);
	}

	addSession(sid) {
		this.sessions[sid] = new terafm.Session({}, sid);
	}

	truncate(max) {
		if(max === undefined || this.length <= max) return this;
		let tmp = {};
		this.each((sess, sid) => {
			if(max===0) return false;
			tmp[sid] = sess;
			max--;
		})
		this.sessions = tmp;
		return this;
	}

	// getFirst() {
	// 	var tmp = Object.keys(this)[0];
	// 	return new terafm.Session(this[tmp], tmp);
	// }

	getEntriesByEditable(eid) {
		let entrylist = new terafm.EntryList();
		this.each(sess => {
			entrylist.push(sess.getEntryByEditable(eid))
		})
		return entrylist;
	}

	getEntry(sid, eid) {
		if(!this.contains(sid)) return false;
		return this.sessions[sid].entries.hasOwnProperty(eid) ? this.sessions[sid].entries[eid] : null;
	}

	merge(list) {
		if(!(list instanceof terafm.SessionList)) throw new Error('Merge requires another ' + this.constructor.name + ' to merge.');

		let tmp = Object.assign({}, this.sessions);
		list = list.sessions;

		for(let sid in list) {
			if(tmp.hasOwnProperty(sid)) {
				for(let eid in list[sid][eid]) {
					tmp[sid][eid] = list[sid][eid];
				}
			} else {
				tmp[sid] = list[sid];
			}
		}

		return new terafm.SessionList(tmp);
	}
}