window.terafm = window.terafm || {};

terafm.SessionList = class SessionList {
	constructor(obj) {
		Object.assign(this, obj);
	}

	get length() {
		return Object.keys(this).length;
	}

	getFirst() {
		var tmp = Object.keys(this)[0];
		return new terafm.Session(this[tmp], tmp);
	}

	merge(list) {
		if(!(list instanceof terafm.SessionList)) {
			throw new Error('Merge requires another ' + this.constructor.name + ' to merge.')
		}

		let tmp = Object.assign({}, this);
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