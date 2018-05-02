window.terafm = window.terafm || {};

terafm.SessionList = class SessionList {
	constructor(obj={}) {
		this.sessions = obj;
	}

	get length() {
		return Object.keys(this.sessions).length;
	}

	getArray() {
		return Object.values(this.sessions);
	}

	countEntries() {
		let i=0;
		this.each((sess) => {
			i += sess.length;
		})
		return i;
	}

	index(i) {
		return this.sessions[Object.keys(this.sessions)[i]];
	}

	copy() {
		return new terafm.SessionList(this.sessions);
	}

	// Rename to map, make another each that does not delete if !== undefined
	each(fn) {
		const sids = Object.keys(this.sessions).reverse();
		for(let sid of sids) {
			let tmp = fn(this.sessions[sid], sid);

			if(tmp === false) break;
			else if(tmp === null) {delete this.sessions[sid]; console.log('deleted?', sid, 'tmp result:', tmp);}
			else if(tmp !== undefined) this.sessions[sid] = tmp;
		}
		return this;
	}

	filter(fn) {
		return this.each((sess, sid) => {
			let res = fn(sess, sid);
			if(res !== true) delete this.sessions[sid];
			if(res === false) return false;
		});
	}

	filterEntries(fn) {
		return this.each(function(sess, sid) {
			return sess.each(function(entry, sid, eid) {
				return fn(entry, sid, eid);
			})
		});
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

	// truncate(max) {
	// 	if(max === undefined || this.length <= max) return this;
	// 	let tmp = {};
	// 	this.each((sess, sid) => {
	// 		if(max===0) return false;
	// 		tmp[sid] = sess;
	// 		max--;
	// 	})
	// 	this.sessions = tmp;
	// 	return this;
	// }

	// getFirst() {
	// 	var tmp = Object.keys(this)[0];
	// 	return new terafm.Session(this[tmp], tmp);
	// }

	getEntryList() {
		let entrylist = new terafm.EntryList();
		this.each(sess => {
			sess.each(entry => {
				entrylist.push(entry);
			})
		})
		return entrylist;
	}

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