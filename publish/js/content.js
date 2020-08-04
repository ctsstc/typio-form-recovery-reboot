window.terafm = window.terafm || {};

terafm.StorageBucket = class Bucket {
	constructor(domainId, setObj) {
		this.domainId = domainId;

		this.context = {
			[this.domainId]: {
				fields: {} 
			}
		};

		if(setObj) this.set(setObj)
	}

	get fields() {
		return this.context[this.domainId].fields;
	}

	get sessionIds() {
		return this._sessionIds !== undefined ? this._sessionIds : this._sessionIds = this.generateSessionIds();
	}

	empty() {
		this.context[this.domainId].fields = {};
	}

	del(sid, eid) {
		if(this.fields.hasOwnProperty(eid) && this.fields[eid].sess.hasOwnProperty(sid)) {
			delete this.fields[eid].sess[sid];
			if(Object.keys(this.fields[eid].sess).length === 0) {
				delete this.fields[eid];
			}
			console.log('found to delete!')
		}
	}

	set(obj) {
		let objk = Object.keys(obj);

		// Create bucket from data read from storage (storage.local.get)
		if(objk.length === 1 && objk[0].indexOf('###') === 0) {
			this.context = obj;
		} else {
			this.setFieldObj(obj);
		}
	}

	// Used when migrating from IndexedDB
	setFieldObj(fieldsObj) {
		this.context[this.domainId].fields = fieldsObj;
	}

	generateSessionIds() {
		let ids = [];
		for(let fid in this.fields) {
			ids = ids.concat(Object.keys(this.fields[fid].sess));
		}
		return ids.sort();
	}

	setEntry(entry) {
		if(!(entry instanceof terafm.Entry)) throw new Error();

		// Editable is not already in bucket, create it
		if(!this.fields.hasOwnProperty(entry.editableId)) {
			this.fields[entry.editableId] = {
				meta: entry.meta,
				sess: {}
			};
		}
		
		// Append entry to editable in bucket
		this.fields[entry.editableId].sess[entry.sessionId] = { value: entry.value, origin: window.location.href };
	}

	copy() {
		let res;
		// console.time('Copy bucket');
		res = JSON.parse(JSON.stringify(this));
		// console.timeEnd('Copy bucket');
		return res;
	}

	getLatestSession(excludeSid) {
		let msid = Math.max(...this.sessionIds);
		if(msid === excludeSid) msid = this.sessionIds.sort().reverse()[1];
		return this.getSession(msid);

	}

	getEntries(max, excludeEid, filterFn) {
		let allsess = this.getSessions();
		let entrylist = new terafm.EntryList();

		allsess.each(sess => {
			sess.each(entry => {
				//debugger;
				if(excludeEid && entry.editableId === excludeEid) return null;
				if(typeof filterFn === 'function' && filterFn.call(null, entry) == false) return false;
				if(Number.isInteger(max) && max > 0) max--; else if(Number.isInteger(max)) return false;
				entrylist.set(entry);
			})
			if(Number.isInteger(max) && max < 1) return false;
		});

		return entrylist;
	}

	getSessions(_sids=[], max=-1) {
		let sids = _sids && _sids.length ? _sids : this.sessionIds.reverse();
		let sesslist = new terafm.SessionList();

		for(let sid of sids) {
			let tmpsess = new terafm.Session(sid);

			for(let fid in this.fields) {
				if(this.fields[fid].sess.hasOwnProperty(sid)) {
					tmpsess.push(new terafm.Entry({
						session: tmpsess,
						sessionId: sid,
						editableId: fid,
						value: this.fields[fid].sess[sid].value,
						meta: this.fields[fid].meta,
						originURL: this.fields[fid].sess[sid].origin,
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
		const sids = Object.keys(this.fields[eid].sess).reverse();
		return this.getSessions(sids, max);
	}


	getSession(sid) {
		let sess = new terafm.Session(sid);

		for(let eid in this.fields) {
			if(this.fields[eid].sess.hasOwnProperty(sid)) {
				sess.push(
					new terafm.Entry({
						session: sess,
						sessionId: sid,
						editableId: eid,
						value: this.fields[eid].sess[sid].value,
						meta: this.fields[eid].meta,
						originURL: this.fields[eid].sess[sid].origin,
					})
				);
			}
		}

		return sess;
	}
	getEntry(sid, eid) {
		if(this.fields.hasOwnProperty(eid) && this.fields[eid].sess.hasOwnProperty(sid)) {
			return new terafm.Entry({
				session: null,
				sessionId: sid,
				editableId: eid,
				value: this.fields[eid].sess[sid].value,
				meta: this.fields[eid].meta,
				originURL: this.fields[eid].sess[sid].origin,
			});
		}
	}
}
window.terafm = window.terafm || {};

terafm.Editable = class Editable {
	constructor(el) {
		this.el = el;
		this.isHighlighed = false;
	}

	get path() {
		return this._path ? this._path : this._path = terafm.generatePath(this.el);
	}
	get id() {
		return this._id ? this._id : this._id = terafm.editables.generateId(this.path);
	}
	get type() {
		return this._type ? this._type : this._type = terafm.editables.getType(this.el);
	}
	get sessionId() {
		return this._sessionId || terafm.db.getGlobalSessionId();
	}

	get metaString() {
		if(this.isTextEditable()) return;

		// Checkbox or radio
		if(this.el.type && ['checkbox', 'radio'].includes(this.el.type) ) {
			return this.el.name + ': ' + this.el.value;

		// All other input types (select, range, color, date etc)
		} else if(this.el.type) {
			return this.el.name;
		}
	}

	is(editable) {
		if(!(editable instanceof terafm.Editable)) throw new Error('Editable.is requires an editable to compare.');
		return this.el === editable.el;
	}

	flashHighlight() {
		this.highlight();
		setTimeout(this.remHighlight.bind(this), 	200);
		setTimeout(this.highlight.bind(this), 		400);
		setTimeout(this.remHighlight.bind(this),	600);
		setTimeout(this.highlight.bind(this), 		800);
		setTimeout(this.remHighlight.bind(this), 	1000);
	}

	highlight() {
		if(!this.isHighlighed) {
			var attr = this.el.getAttribute('style') || '';
			this.el.terafmOrgStyle = attr;
			this.el.style.background = 'rgb(255, 251, 153)';
			this.el.style.color = '#222';
			this.isHighlighed = true;
		}
	}
	remHighlight() {
		if(this.isHighlighed && this.el.terafmOrgStyle !== undefined) {
			this.el.setAttribute('style', this.el.terafmOrgStyle);
			delete this.el.terafmOrgStyle;
			this.isHighlighed = false;
		}
	}

	applyPlaceholderEntry(entry) {
		this.applyEntry(entry, {truncate: this.isContentEditable() ? false : 5000});
		this.highlight();
	}

	applyEntry(entry, opts) {
		if(!(entry instanceof terafm.Entry)) throw new Error('applyEntry requires an entry to set');
		
		let tmpVal;
		let usePaste = false;

		// contenteditable into text
		if(false === this.isContentEditable() && entry.type === 'contenteditable') {
			tmpVal = entry.getValue({stripTags: true, decodeHTMLEntities: true, trim: true, ...opts});

		// text into contenteditable
		} else if(true === this.isContentEditable() && entry.type !== 'contenteditable') {
			tmpVal = entry.getValue({encodeHTMLEntities: true, ...opts});


		}/* else if(this.el.closest('.DraftEditor-root') || window.location.hostname.indexOf('facebook.com') !== -1) {
			console.log('is probably draft editor');
			tmpVal = entry.getValue({stripTags: true, decodeHTMLEntities: true, trim: true, ...opts});
			// tmpVal = entry.getValue(opts)
			usePaste = true;

		// anything else
		}*/ else {
			tmpVal = entry.getValue(opts)
		}

		this.setValue(tmpVal, usePaste);
	}

	getValue(trim) {
		let value;

		if(terafm.editables.isNode(this.el, 'input') || terafm.editables.isNode(this.el, 'textarea') || terafm.editables.isNode(this.el, 'select')) {

			// Special care for checkable inputs
			if(this.el.type === 'checkbox' || this.el.type === 'radio') {
				value = this.el.checked ? '1' : '0';

			} else {
				value = this.el.value;
			}

		// Contenteditable
		} else {
			if(trim) {
				value = this.el.textContent;
			} else {
				value = this.el.innerHTML;
			}
		}

		value += '';

		if(trim) {
			return value.trim();
		}

		return value;
	}
	setValue(val, usePaste=false) {
		terafm.editables.pauseLoggingForJustABit();
		terafm.defaults.add(this);

		if(terafm.editables.isNode(this.el, 'INPUT') || terafm.editables.isNode(this.el, 'TEXTAREA')) {

			if(this.el.type === 'checkbox' || this.el.type === 'radio') {
				val = parseInt(val);
				this.el.checked = val ? true : false;

			} else {
				this.el.value = val;
			}

		} else if(terafm.editables.isNode(this.el, 'SELECT')) {
			this.el.value = val;

		}/* else if(this.isContentEditable() && usePaste) {
			// setTimeout(() => {
			// this.el.dispatchEvent(new Event('click'));
			document.execCommand('selectAll', false, null);
			document.execCommand('insertText', false, val);
			// }, 20)

		}*/ else {
			this.el.innerHTML = val;
		}
	}

	touch() {
		if(this.isTextEditable()) {
			const currLen = this.getValue(true).length;
			const oldLen = this.length;

			// If input was cleared, set new ID
			if(oldLen > 1 && currLen === 0) {
				this._sessionId = terafm.db.generateSessionId();
				// console.log('new id yo!');
			}

			this.length = currLen;
		}
	}

	isEmpty() {
		if(this.isContentEditable()) {
			let txt = terafm.help.trim(this.el.innerText);
			return txt.length < 1;
		} else {
			return (this.getValue() + '').trim().length < 1;
		}
	}

	isEditable() {
		return terafm.editables.isEditable(this.el)
	}
	isTextEditable() {
		return terafm.editables.isTextEditable(this.el)
	}
	isContentEditable() {
		return terafm.editables.isContentEditable(this.el);
	}
	isBigTextEditable() {
		return terafm.editables.isBigTextEditable(this.el);
	}
	
	getEntry(opts) {
		return new terafm.Entry(this, opts);
	}

	rect() {
		var parent = this.el,
			size = this.el.getBoundingClientRect(),
			bodyRect = bodyRect = document.body.getBoundingClientRect(),
			rect = {x: 0, y: 0, width: size.width, height: size.height};

		while(parent) {
			var prect = parent.getBoundingClientRect()
			rect.x += prect.x;
			rect.y += prect.y;

			if(parent !== this.el) {
				rect.x += parent.clientLeft;
				rect.y += parent.clientTop;
			}
			parent = parent.ownerDocument.defaultView.frameElement;
		}

		if(window.getComputedStyle(document.body)['position'] !== 'static') {

			// Make position relative to body
			rect.x -= bodyRect.x;
			rect.y -= bodyRect.y;

		} else {
			rect.x += window.scrollX;
			rect.y += window.scrollY;
		}

		return rect;
	}
}


window.terafm = window.terafm || {};

terafm.EditableList = class EditableList {
	constructor(session) {
		this.clear();
		if(session instanceof terafm.Session) {
			this.set(session);
		}
	}

	get length() { return this.editables.length; }

	contains(checkEditable) {
		return Object.keys(this.editables).indexOf(checkEditable.id) !== -1;
	}

	push(editable) {
		if(!(editable instanceof terafm.Editable)) return;
		// if(this.contains(editable)) return; // skip for performance
		this.editables[editable.id] = editable;
	}
	set(data) {
		if(data instanceof terafm.Session) {
			this.clear();
			data.each(entry => this.push(entry.getEditable()))
		} else {
			throw new Error('EditableList cannot convert supplied data type');
		}
	}

	delete(editable) {
		if(editable.id) delete this.editables[editable.id];
	}

	clear() {
		this.editables = {};
	}



	filter(fn) {
		for(let eid in this.editables) {
			let res = fn(this.editables[eid]);
			if(res !== true) delete this.editables[eid];
			if(res === false) break;
		}
		return this;
	}
}

window.terafm = window.terafm || {};

terafm.Entry = class Entry {
	constructor(arg, opts = {resolveUncheckedRadios: false, context: null}) {
		this.meta = {};

		// Make Entry from editable
		if(arg instanceof terafm.Editable) {

			if(opts.resolveUncheckedRadios && arg.type === 'radio') {
				arg = this.resolveRadio(arg) || arg;
			}

			if(opts.context) {
				this.session = opts.context.session;
				this._editable = opts.context._editable;
			} else {
				this._editable = arg;
			}
			
			this.editableId = this._editable.id;
			this.sessionId = this._editable.sessionId;

			this.value = arg.getValue();
			this.meta.path = arg.path;
			this.meta.type = arg.type;

			var metaStr = arg.metaString;
			if(metaStr) this.meta.meta = metaStr;


		// Straight from DB, see StorageBucket.getEntry()
		} else {
			Object.assign(this, arg);
		}
	}

	get type() {
		return this.meta.type;
	}
	get path() {
		return this.meta.path;
	}
	get metaStr() {
		return this.meta.meta || '';
	}

	valueContains(string) {
		return this.getValue({ stripTags: this.type === 'contenteditable' })
			.replace(/\s/g, '')
			.toLowerCase()
			.indexOf(
				string.replace(/\s/g, '').toLowerCase()
			);
	}

	resolveRadio(ed) {
		if(ed.type === 'radio' && ed.el.checked === false) {
			let sel = ed.el.getRootNode().querySelector('input[type=radio][name="'+ ed.el.name +'"]:checked');
			if(sel) return new terafm.Editable(sel);
		}
		else return ed;
	}

	copy(opts) {
		// return new terafm.Entry(this, opts);
		return new terafm.Entry(this.getEditable(), {...opts, context: this});
	}

	isTextType() {
		return terafm.editables.isTextEditableType(this.type);
	}

	getValue(opts = {encodeHTMLEntities: false, decodeHTMLEntities: false, stripTags: false, truncate: false, trim: false, retainLineBreaks: false}) {

		var str = this.value;

		if(opts.stripTags) {
			str = terafm.help.stripTags(str);
		}

		if(opts.encodeHTMLEntities) {
			str = terafm.help.encodeHTMLEntities(str);
		}

		if(opts.decodeHTMLEntities) {
			str = terafm.help.decodeHTMLEntities(terafm.help.stripTags(str));
		}

		if(typeof opts.truncate === 'number' && str.length > opts.truncate) {
			str = str.substring(0, opts.truncate) + '...';
		}

		if(opts.retainLineBreaks) {
			str = str.replace(/[\r\n]/gm, '<br/>');
		}

		if(opts.trim) {
			str = terafm.help.trim(str);
		}

		return str;
	}

	getPrintableValue(opts) {
		let value = '';
		let entry = this;

		if(entry.type === 'radio' && entry.meta.meta) {
			value += terafm.help.encodeHTMLEntities(entry.meta.meta); // Meta contains name:value, we don't care about the "checked" value here (its always 1 because its selected)

		} else if(entry.type === 'checkbox' && entry.meta) {
			value += terafm.help.encodeHTMLEntities(entry.meta.meta) + (entry.value == '1' ? ' (checked)' : ' (unchecked)');

		} else {
			if(entry.meta.meta) {
				value = terafm.help.encodeHTMLEntities(entry.meta.meta) + ': ';
			}

			if(entry.type === 'contenteditable') {
				value += this.getValue({stripTags: true, trim: true, ...opts});
			} else {
				value += this.getValue({encodeHTMLEntities: true, trim: true, ...opts});
			}
		}

		return value;
	}

	setPlaceholder() {
		let editable = this.getEditable();
		if(editable) {
			editable.applyPlaceholderEntry(this);
		}
	}

	restore(opts = {flash: false, clone: true}) {
		let editable = this.getEditable();
		if(editable) {
			editable.applyEntry(this);
			if(opts.flash) editable.flashHighlight();
		}
		if(opts.clone !== false && terafm.options.get('cloneOnRestore') === true) {
			this.sessionId = terafm.db.getGlobalSessionId();
			this.save();
		}
	}

	save() {
		terafm.db.saveEntry(this);
	}

	getSession() {
		return this.session;
	}

	hasEditable() {
		return !!this.getEditable();
	}

	getEditable() {
		if(this._editable !== undefined) {
			return this._editable;
		} else {
			this._editable = terafm.editables.get(this.path);
			return this._editable;
		}
	}

	delete(callback) {
		terafm.db.del(this.sessionId, this.editableId, callback);
	}
}
window.terafm = window.terafm || {};

terafm.EntryList = class EntryList {
	constructor(opts = {uniqueEditables: false}) {
		this.entries = [];
		
		this.uniqueEditables = opts.uniqueEditables;
		
		if(opts.uniqueEditables) {
			this.indexes = {};
		}
	}

	get length() { return this.entries.length; }

	update(data) {
		this.set(data, {override: true});
	}
	set(data, opts={override: false}) {

		// Sessions and entries will use supplied entry with static value
		// Editables will always create a new entry with current value

		if(data instanceof terafm.Entry) {
			let entry = data;

			if(this.uniqueEditables) {
				let i = this.containsEditable(entry);

				if(i === false) {
					this.indexes[entry.editableId] = this.entries.push(entry);

				} else if(opts.override) {
					this.entries[i] = entry;
				}

			// Don't care about dupes or indexing
			} else {
				// console.log('saving', entry.getEditable().el, [entry.obj.value]);
				this.entries.push(entry);
			}


		} else if(data instanceof terafm.Session) {
			data.each(entry => this.set(entry, opts));

		} else if(data instanceof terafm.EditableList) {
			for(let eid in data.editables) {
				this.set(data.editables[eid], opts);
			}

		} else if(data instanceof terafm.Editable) {
			if(this.uniqueEditables) {
				if(this.containsRadio(data)) {
					return false;
				}
			}

			let entry = data.getEntry({resolveUncheckedRadios: true});
			this.set(entry, opts);

		} else {
			throw new Error('EntryList cannot convert supplied data type');
		}
	}

	containsRadio(editable) {
		if(editable.el.type !== 'radio') return false;

		for(let entry of this.entries) {
			if(entry._editable.el.name === editable.el.name) {
				if(entry._editable.el.rootNode === editable.el.rootNode) {
					return true;
				}
			}
		}
		return false;
	}

	// Alias for set()
	push(data) {
		return this.set(data)
	}

	filter(fn) {
		for(let eid in this.entries) {
			let res = fn(this.entries[eid]);
			if(res !== true) delete this.entries[eid];
			if(res === false) break;
		}
		return this;
	}

	clear() {
		this.entries = [];
		this.indexes = {};
	}


	applyEntries() {
		// console.log('applyEntries', this.entries, this.indexes)
		for(let entry of this.entries) entry.restore();
		return this;
	}

	each(fn) {
		for(let ed of this.entries) fn(ed);
		return this;
	}

	containsEditable(checkEntry) {
		if(!this.uniqueEditables) throw new Error('Cannot check uniqueness for non-unique EntryList');
		return this.indexes.hasOwnProperty(checkEntry.editableId) ? this.indexes[checkEntry.editableId] : false;
	}
}
window.terafm = window.terafm || {};

terafm.Session = class Session {
	constructor(id) {
		this.id = id;
		this.entries = {};
	}

	get length() {
		return Object.keys(this.entries).length;
	}

	getEditables() {
		return new terafm.EditableList(this);
	}

	contains(eid) {
		return this.entries.hasOwnProperty(eid);
	}

	push(entry) {
		if(!(entry instanceof terafm.Entry)) throw new Error('Push requires an Entry to push.')
		this.entries[entry.editableId] = entry;
	}

	deleteAll(callback) {
		const toDelete = [];
		for(let eid in this.entries) {
			toDelete.push([this.id, eid]);
		}
		terafm.db.delMultiple(toDelete, callback);
	}

	each(fn) {
		for(let eid in this.entries) {
			let tmp = fn(this.entries[eid], this.id, eid);
			if(tmp === false) break;
			else if(tmp === null) delete this.entries[eid];
			else if(tmp !== undefined) this.entries[eid] =tmp;
		}
		return this;
	}

	// Only keep entry if fn returns true
	filter(fn) {
		for(let eid in this.entries) {
			if(fn(this.entries[eid]) !== true) {
				delete this.entries[eid];
			}
		}
	}

	getFirstEntry() {
		for(const eid in this.entries) {
			return this.entries[eid];
		}
	}

	prettyDate() {
		return terafm.help.prettyDateFromTimestamp(this.id);
	}

	setPlaceholders() {
		this.each((entry) => entry.setPlaceholder());
	}

	restore(opts) {
		this.each((entry) => entry.restore(opts));
	}

	getEntryByEditable(eid) {
		return this.entries.hasOwnProperty(eid) ? this.entries[eid] : null;
	}
}
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

	getEntriesByEditable(eid, max) {
		let entrylist = new terafm.EntryList();
		this.each(sess => {
			entrylist.push(sess.getEntryByEditable(eid))
			max--; if(max < 1) return false;
		});
		return entrylist;
	}

	getEntry(sid, eid) {
		if(!this.contains(sid)) return false;
		return this.sessions[sid].entries.hasOwnProperty(eid) ? this.sessions[sid].entries[eid] : null;
	}
	deleteEntry(sid, eid, callback) {
		if(!this.contains(sid)) return false;
		this.getEntry(sid, eid).delete(() => {
			if(this.sessions[sid].entries.hasOwnProperty(eid)) delete this.sessions[sid].entries[eid];
			if(callback) callback();
		});
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
window.terafm = window.terafm || {};
terafm.initHandler = {};

(function(initHandler) {
	'use strict';

	let initHandlers = [],
		isInitiated = false;


	initHandler.onInit = function(callback) {
		if (isInitiated) callback();
		else initHandlers.push(callback);
	}

	initHandler.executeInitHandlers = function() {
		isInitiated = true;
		initHandlers.forEach(function(func) {
			func();
		});
	}

})(terafm.initHandler);
window.terafm = window.terafm || {};
terafm.help = (function() {
	'use strict';

	var exp = {};

	exp.hashStr = function(str) {
		var hash = 0;
		if (str.length == 0) return hash;
		for (var i = 0; i < str.length; i++) {
			var char = str.charCodeAt(i);
			hash = ((hash<<5)-hash)+char;
			hash = hash & hash;
		}
		return hash;
	}


	exp.trim = function(str) {
		return str.replace(/[\s\n\r]+/g, ' ').trim();
	}

	exp.stripTags = (() => {
		var tmp = document.createElement('div');
		return (html) => {
			tmp.innerHTML = html;
			return tmp.textContent;
		}
	})();

	// https://stackoverflow.com/a/47192491/290790
	exp.encodeHTMLEntities = (function() {
		var doc = document.implementation.createDocument("", "", null),
			el = doc.createElement("terafmXMLTemp");
		el.textContent = "terafmXMLTemp";
		el = el.firstChild;
		var ser =  new XMLSerializer();
		return function(str) {
			el.nodeValue = str;
			return ser.serializeToString(el);
		};
	})();

	exp.decodeHTMLEntities = function(str) {
		var parser = new DOMParser,
			dom = parser.parseFromString('<!doctype html><body>' + str, 'text/html');

		return dom.body.textContent.trim();
	}

	exp.escapeRegExp = function(str) {
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}

	exp.cloneObject = function(orgObj) {
		return Object.assign({}, orgObj);
	}

	exp.prettyDateFromTimestamp = function(timestamp) {
		var timezoneOffsetMs =  (new Date()).getTimezoneOffset() * 60000,
			date =  new Date( (timestamp*1000) - timezoneOffsetMs ),
			pretty = exp.prettyDate(date.toISOString());

		if(!pretty) {
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: 'numeric',
				minute: 'numeric'
			});
		}

		return pretty;
	}

	exp.prettyDate = function(time) {
		var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " ")),
		diff = (((new Date()).getTime() - date.getTime()) / 1000),
		day_diff = Math.floor(diff / 86400);

		if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) return;

		if(day_diff == 1) {
			return 'Yesterday at ' + date.getHours() + ':' + date.getMinutes();
		}

		return day_diff == 0 && (diff < 60 && "Just now" || diff < 120 && "1 minute ago" || diff < 3600 && Math.floor(diff / 60) + " minutes ago" || diff < 7200 && "1 hour ago" || diff < 86400 && Math.floor(diff / 3600) + " hours ago");
	}


	exp.copyToClipboard = function(text) {
		var input = document.createElement('input');
		input.setAttribute('value', text);
		input.setAttribute('class', 'typioIgnoreField');
		document.body.appendChild(input);
		input.select();
		var result = document.execCommand('copy');
		document.body.removeChild(input)
		return result;
	}



	// https://davidwalsh.name/javascript-debounce-function
	// Returns a function, that, as long as it continues to be invoked, will not
	// be triggered. The exp.will = function be called after it stops being called for
	// N milliseconds. If `immediate` is passed, trigger the exp.on = function the
	// leading edge, instead of the trailing.
	exp.debounce = function(func, wait, immediate, after) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate || after) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	}

	// From underscore.js
	// Found here: https://stackoverflow.com/a/27078401/290790
	exp.throttle = function(func, wait, options) {
		var context, args, result;
		var timeout = null;
		var previous = 0;
		if (!options) options = {};
		var later = function() {
			previous = options.leading === false ? 0 : Date.now();
			timeout = null;
			result = func.apply(context, args);
			if (!timeout) context = args = null;
		};
		return function() {
			var now = Date.now();
			if (!previous && options.leading === false) previous = now;
			var remaining = wait - (now - previous);
			context = this;
			args = arguments;
			if (remaining <= 0 || remaining > wait) {
				if (timeout) {
					clearTimeout(timeout);
					timeout = null;
				}
				previous = now;
				result = func.apply(context, args);
				if (!timeout) context = args = null;
			} else if (!timeout && options.trailing !== false) {
				timeout = setTimeout(later, remaining);
			}
			return result;
		};
	};


	exp.parentElem = function(elem, cb) {
		var parent = elem.parentElement;
		if (!parent) return undefined;
		return fn(parent) ? parent : parentElem(parent, cb);
	}

	exp.prettyKeys = function(keyarr) {

		for(var ki in keyarr) {
			keyarr[ki] = '<span class="key">' + keyarr[ki] + '</span> '
		}

		return keyarr.join(' + ')

	}

	return exp;
})();




window.terafm = window.terafm || {};
window.terafm.optionSanitizer = {};

(function(optionSanitizer) {
	'use strict';

	var sanitizers = {

		// Generic, can be reused
		bool: function(bool) {
			return bool == true ? true : false;
		},
		hexColor: function(value) {
			return /^(#[0-9a-f]{6}|[0-9a-f]{3})$/i.test(value) ? value : undefined;
		},
		yearInDays: function(days) {
			days = parseInt(days);
			return	(days > 0 && days < 366) ? days :
					(days > 365) ? 365 : 
					(days < 1) ? 1 :
					undefined;
		},

		// Specific ones
		keyBinding: function(value) {
			return value.replace(/\s/g, '').split('+');
			// return value.replace(/[^a-z+]/gi, '').split('+');
		},
		saveIndicator: function(value) {
			return ['topline', 'cornertriag', 'disable'].includes(value) ? value : undefined;
		},
		quickAccessTrigger: function(value) {
			return ['focus', 'doubleclick'].includes(value) ? value : undefined;
		}
	};


	var pointers = {
		savePasswords: sanitizers.bool,
		saveCreditCards: sanitizers.bool,
		hideSmallEntries: sanitizers.bool,
		saveIndicatorColor: sanitizers.hexColor,
		storageTimeDays: sanitizers.yearInDays,
		quickAccessButtonEnabled: sanitizers.bool,
		quickAccessButtonTrigger: sanitizers.quickAccessTrigger,
		cloneOnRestore: sanitizers.bool,
		resetEditablesBetweenRestorations: sanitizers.bool,
		qaGroupSessions: sanitizers.bool,
		qaEnableSessionSubmenu: sanitizers.bool,

		keybindToggleRecDiag: sanitizers.keyBinding,
		keybindRestorePreviousSession: sanitizers.keyBinding,
		keybindOpenQuickAccess: sanitizers.keyBinding,
		keybindEnabled: sanitizers.bool
	}

	optionSanitizer.sanitize = function(name, value) {

		if(typeof name === 'object') {
			value = name;
			for(name in value) {
				value[name] = optionSanitizer.sanitize(name, value[name])
			}
			return value

		} else {
			
			// Sanitazer found (generic)
			if(name in pointers) {
				return pointers[name](value)

			// Custom sanitizer found (specific)
			} else if(name in sanitizers) {
				return sanitizers[name](value)

			// No sanitizer found, fail
			} else {
				return undefined;
			}

		}
	}

})(terafm.optionSanitizer);
window.terafm = window.terafm || {};
window.terafm.defaultOptions = {};

// Default options as stored in database. Needs to be sanitized (keybindigs especially).
(function(defaultOptions, help) {
	'use strict';

	var def = {}
	
	def.savePasswords = false;
	def.saveCreditCards = false;
	def.storageTimeDays = 7;
	def.saveIndicator = 'disable';
	def.saveIndicatorColor = '#3CB720';
	def.hideSmallEntries = true;
	def.keybindEnabled = true;
	def.quickAccessButtonEnabled = true;
	def.quickAccessButtonTrigger = 'focus';
	def.cloneOnRestore = false;
	def.resetEditablesBetweenRestorations = false;
	def.qaGroupSessions = true;
	def.qaEnableSessionSubmenu = true;

	// Mac specific
	if(window.navigator.platform.toLowerCase().indexOf('mac') !== -1) {
		def.keybindToggleRecDiag = 'Control + Backspace';
		def.keybindRestorePreviousSession = 'Control + Alt + Backspace';
		def.keybindOpenQuickAccess = 'Control + r';

	// Windows and everything else
	} else {
		def.keybindToggleRecDiag = 'Alt + Backspace';
		def.keybindRestorePreviousSession = 'Shift + Alt + Backspace';
		def.keybindOpenQuickAccess = 'Alt + r';
	}
	



	defaultOptions.get = function(opt) {
		return opt in def ? def[opt] : undefined
	}

	defaultOptions.getAll = function() {
		return def
	}


})(terafm.defaultOptions, terafm.helpers);
window.terafm = window.terafm || {};
window.terafm.options = {};

(function(options, defaultOptions, optionSanitizer) {
	'use strict';

	var hasLoadedFromStorage;


	// Default values, can be overwritten and saved in chrome
	var globalOptions = optionSanitizer.sanitize(defaultOptions.getAll())

	options.set = function(opt, val) {
		var san = optionSanitizer.sanitize(opt, val)
		if(san !== undefined) {
			chrome.storage.sync.set({ [opt] : val });
			globalOptions[opt] = val	
		} else {
			throw new Error('Option could not be sanitized', opt, val);
		}
	}

	options.get = function(opt) {
		if(!hasLoadedFromStorage) return false;
		return globalOptions[opt];
	}

	options.getAll = function() {
		if(!hasLoadedFromStorage) return false;
		return globalOptions;
	}

	options.loadFromChromeStorage = function(callback) {

		// Override default options
		chrome.storage.sync.get(null, function(options) {
			if(options) {
				for(var opt in options) {

					// Sanitize stored value
					var san = optionSanitizer.sanitize(opt, options[opt]);

					// If sanitazion passes, override default value
					if(san !== undefined) {
						globalOptions[opt] = san;
					}
				}
			}

			// console.log(globalOptions)

			hasLoadedFromStorage = true;
			if(callback) callback();
		});

	}

})(terafm.options, terafm.defaultOptions, terafm.optionSanitizer);
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

		// console.time('Merge buckets');
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
		// console.timeEnd('Merge buckets');

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
		// console.log('sync');
		return fetchAndMerge().then(pushBucket);
	}


	db.init = function(done) {
		// chrome.storage.local.clear();return;
		convertIndexedDB().then(function() {
			// console.log(buckets);
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
	db.getLatestSession = () => {
		return buckets.snapshot.getLatestSession(sessionId);
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
	db.delMultiple = (toDelete, callback) => {
		fetchAndMerge().then(mergeBuck => {
			for(const [sid, eid] of toDelete) {
				buckets.inUse.del(sid, eid);
				mergeBuck.del(sid, eid);
			}
			pushBucket(mergeBuck).then(fetchSnapshot).then(callback);
		});
	}
	db.deleteAllDataForDomain = () => {
		buckets.inUse.empty();
		buckets.snapshot.empty();
		pushBucket(buckets.snapshot).then(fetchSnapshot);
	}
	db.getDomainSize = () => {
		return new Promise(done => {
			chrome.storage.local.getBytesInUse(domainId, done);
		})
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

				let bucket = new terafm.StorageBucket(domainId);
				bucket.setFieldObj(newd);
				chrome.storage.local.set(bucket.context, done);
			})
		})
	}

	function getIndexedDBData() {
		return new Promise(done => {
			terafm.indexedDB.init((exists) => {
				if(exists === true) {

					terafm.indexedDB.load(res => {
						if(res === false) return done(false);
						let json = false;
						try {
							json = JSON.parse(res);
						} catch(e) {}

						terafm.indexedDB.destroy();
						done(json);
					})
				} else {
					done(false);
				}
			})
		})
	}

})(terafm.db);
window.terafm = window.terafm || {};

(function() {

	var db,
		init = undefined;

	window.terafm.indexedDB = {

		// save: function(data, callback) {

			// 	if(!init) {
			// 		throw new Error('Typio: Cannot save before IndexedDB has been initialized.');
			// 		return false;
			// 	}

			// 	var transaction = prepareTransaction(callback);

			// 	var objectStore = transaction.objectStore("storage"),
			// 		updateRequest = objectStore.put(data, 'inputs');

			// 	updateRequest.onerror = function() {
			// 		console.error('Typio Form Recovery: Could not save to database.');
			// 	}
		// },

		load: function(callback) {

			try {
				var transaction = prepareTransaction();
			} catch(e) {
				// DB exists but object store doesn't.
				return callback(false);
			}

			var objectStore = transaction.objectStore("storage"),
				request = objectStore.get('inputs');

			request.onsuccess = function(e) {
				callback(e.target.result);
			}

		},

		init: function(callback) {
			if(init !== undefined) {
				return callback(init);
			}

			var request = window.indexedDB.open("terafmStorage", 1);

			request.onsuccess = function(event) {
				db = request.result;
				init = true;
				return callback(true);
			};

			// request.onerror = function(event) {
			// 	return callback(false);
			// }

			request.onupgradeneeded = function(event) {
				event.target.transaction.abort();
				return callback(false);
				// event.target.result.createObjectStore("storage");
			};
		},


		destroy: function() {
			if(init) {
				indexedDB.deleteDatabase('terafmStorage');
			}
		}

	}

	function prepareTransaction(callback) {
		if(db) {
			var transaction = db.transaction(["storage"], "readwrite");

			transaction.oncomplete = callback;

			transaction.onerror = function(event) {
				console.error('Typio Form Recovery: Could not create database transaction.');
			};
			return transaction;
		}
	}

})();

window.terafm = window.terafm || {};

(function() {
	'use strict';

	// querySelector with ::shadow support
	terafm.resolvePath = function(selector) {

		var pathData = splitSelectorByEncapsulators(selector),
			currNode = window.top.document;

		for(var pathIndex = 0; pathIndex < pathData.paths.length; ++pathIndex) {
			var currSel = pathData.paths[pathIndex];

			try {
				currNode = currNode.querySelector(currSel);
			} catch(e) {
				throw new Error('Typio: querySelector failed on path:', currSel);
				return false;
			}

			// If node was not found, abort
			if(!currNode) {
				return false;
			} else {
				// console.log('success:', currNode, currSel);
			}


			if(pathData.instructions[pathIndex] === 'iframe') {
				currNode = currNode.contentDocument;
				if(!currNode) return false;
			}

			// If node is shadow host, go inside
			else if(pathData.instructions[pathIndex] === 'shadow') {
				currNode = currNode.shadowRoot;
				if(!currNode) return false;
			}
		}

		return currNode;
	}

	function splitSelectorByEncapsulators(selector) {
		var selParts = selector.split(/[\s>]+/g);

		let res = { paths: [], instructions: [] };

		// Loop through each "node" in path
		for(let partId=0; partId< selParts.length; ++partId) {
			let part = selParts[partId];

			if(part.indexOf('::shadow') !== -1) {
				addPath(part.replace('::shadow', ''), 'shadow');
			
			} else if(part.indexOf('iframe') === 0) {
				addPath(part, 'iframe')
			
			} else {
				addPath(part)
			}
		}

		return res;

		function addPath(path, instr) {

			// If no instruction (add to path)
			if(!instr) {

				// If last path index is iframe or shadow, create new index
				if(res.instructions[res.paths.length-1] !== undefined) {
					res.paths.push(path);

				// Add to path
				} else if(res.paths.length) {
					res.paths[res.paths.length-1] += ' > ' + path;

				// Begin path
				} else {
					res.paths[res.paths.length] = path;
				}

			// Iframe or shadow
			} else {
				res.paths.push(path);
				res.instructions[res.paths.length-1] = instr;
			}
		}

	}


})();

window.terafm = window.terafm || {};

(function() {
	'use strict';

	// Heavily modified from: https://stackoverflow.com/a/16742828/290790
	// Careful cause changing this will result in editableID's changing
	// which results in entries not being shown in context menu
	terafm.generatePath = function(el) {

		// Cannot break out of capsules, return fake path
		try{window.top.document} catch(e) {
			return generateFakePath();
		}

		var parentCapsule = getParentCapsule(el), // Will change as it breaks out
			isEncapsulated = parentCapsule ? true : false,
			isShadow = false;

		var stack = [],
			prevEl;

		while(el) {

			// console.log('curr el', el);

			// If top body, stop
			if(el === window.top.document.body) {
				stack.unshift('body');
				break;
			}


			// If capsule
			if(el === parentCapsule) {

				// console.log('reached capsule', el)

				// Shadow root. Add nothing to stack, break out
				if(el.toString() === '[object ShadowRoot]') {
					el = el.host;
					isShadow = true;
				}

				// Iframe body. Add to stack, break out
				else if(el.ownerDocument.defaultView.frameElement) {
					el  = el.ownerDocument.defaultView.frameElement;
				}

				// Find next parent capsule
				parentCapsule = getParentCapsule(el);
				// console.log('next parent capsule is', parentCapsule)

				continue;
			}


			// If el has ID
			if(el.id && el.id.length > 1 /*&& el.id.match(/^[a-z0-9._-]+$/i) !== null*/) {

				let escId = CSS.escape(el.id);

				// var idCount = el.ownerDocument.querySelectorAll('#' + el.id);
				var idCount = el.ownerDocument.querySelectorAll('#'+ escId );

				// If not encapsulated, add to stack and stop
				if(!isEncapsulated && idCount.length === 1) {
					stack.unshift('#' + escId);
					break;
				}

				// If encapsulated, add to stack and break out
				else if(idCount.length === 1) {
					var nodeName = '#' + escId;
					if(isShadow) {
						nodeName += '::shadow';
						isShadow = false;
					}
					if(el.nodeName === 'IFRAME') {
						nodeName = 'iframe' + nodeName;
					}
					stack.unshift(nodeName);

					if(parentCapsule) {
						if(parentCapsule.toString() === '[object ShadowRoot]') {
							el = parentCapsule.host;
							isShadow = true;
						} else {
							el = parentCapsule.ownerDocument.defaultView.frameElement;
						}
						parentCapsule = getParentCapsule(el);
					} else {
						el = el.parentNode;
					}
					continue;
				}
			}


			var nodeName = el.nodeName.toLowerCase();

			var sibIndex = getSiblingIndex(el);
			if(sibIndex !== false) {
				nodeName += ':nth-of-type(' + (sibIndex) + ')';
			}
			if(isShadow) {
				nodeName += '::shadow';
				isShadow = false;
			}

			stack.unshift(nodeName);
			el = el.parentNode;
		}


		stack = stack.join(' > ');

		return stack;
	}

	function generateFakePath() {
		return '#unidentified-' + Math.round(Math.random()*10000000);
	}

	function getSiblingIndex(el) {
		var sibCount = 0;
		var sibIndex = 0;

		// get sibling indexes
		for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
			var sib = el.parentNode.childNodes[i];
			if ( sib.nodeName == el.nodeName ) {
				if ( sib === el ) {
					sibIndex = sibCount;
				}
				sibCount++;
			}
		}

		return sibCount > 1 ? sibIndex+1 : false;
	}

	function getParentCapsule(node) {
		let caps = getParentShadowHost(node) || getParentIframe(node) || false;
		// console.log('parent capsule', caps);
		return caps;
	}

	function getParentShadowHost(node) {

		// Is in shadow DOM?
		for (; node; node = node.parentNode) {
			if (node.toString() === "[object ShadowRoot]") {
				return node;
			}
		}
	}

	function getParentIframe(node) {

		// Is in iframe?
		// console.dir(node);
		if(node.ownerDocument && node.ownerDocument.defaultView.frameElement) {
			return node.ownerDocument.documentElement;
		}
	}

	function getCapsuleHost(node) {
		if(node.ownerDocument.defaultView.frameElement) {
			return node.ownerDocument.defaultView.frameElement;
		} else if(node.host) {
			return node.host;
		}
	}
})();
window.terafm = window.terafm || {};
terafm.editables = {};

(function(editables) {
	'use strict';

	const editableTypes = ['color', 'date', 'datetime-local', 'email', 'month', 'number', 'password', 'checkbox', 'radio', 'range', 'search', 'tel', 'text', 'time', 'url', 'week', 'contenteditable', 'textarea'];
	const textEditableTypes = ['text', 'email', 'search', 'password', 'url', 'tel', 'number', 'contenteditable', 'textarea'];

	let editableCache = new Map();

	editables.get = (el) => getEditable(el);
	editables.getTextEditable = (el) => getEditable(el, true);

	editables.isEditableType = (type) => editableTypes.includes(type);
	editables.isTextEditableType = (type) => textEditableTypes.includes(type);


	function getEditable(el, onlyTextEditable=false) {
		// If path, resolve it
		if(typeof el === 'string') {
			el = terafm.cache(el, () => terafm.resolvePath(el));
		}

		// If within contenteditable, the el itself might not be editable, so find its parent.
		// "input" event usually does this for you, but other events (like keyup or change) doesn't
		if(!editables.isEditable(el) && editables.isElement(el)) {
			const parentEditable = el.closest('[contenteditable]');
			if(parentEditable && parentEditable !== el) {
				return getEditable(parentEditable, onlyTextEditable);
			}
		}

		// Element must have a parent node. Feedly breaks pathGenerator if this isn't here. I assume
		// it has to do with the element being removed from the DOM before it reaches pathGen, and
		// that breaks it.
		if(!el || !el.parentNode) {
			return;
		}

		if(el && editableCache.has(el)) {
			let ed = editableCache.get(el);
			return !onlyTextEditable || (onlyTextEditable && ed.isTextEditable()) ? ed : false;

		} else if(!onlyTextEditable && editables.isEditable(el) || onlyTextEditable && editables.isTextEditable(el)) {
			let ed = new terafm.Editable(el);
			editableCache.set(el, ed);
			return ed;
		}

		return false;
	}
	

	editables.generateId = (path) => {
		return 'field' + terafm.help.hashStr(path);
	}

	editables.getType = (el) => {
		return el.type ? el.type : 'contenteditable'
	}

	editables.isEditable = (elem) => {
		if(!editables.isElement(elem)) return false;

		if(editables.isNode(elem, 'INPUT') && editables.isEditableType(elem.type)) {
			return true;

		} else if(editables.isNode(elem, 'TEXTAREA')) {
			return true;

		} else if(editables.isNode(elem, 'SELECT')) {
			return true;

		} else if(elem.getAttribute('contenteditable') == 'true') {
			return true;
		}

		return false;
	}
	editables.isTextEditable = (elem) => {
		if(!editables.isElement(elem)) return false;

		if(editables.isNode(elem, 'INPUT') && editables.isTextEditableType(elem.type)) {
			return true;

		} else if(elem.getAttribute('contenteditable') == 'true') {
			return true;

		} else if(editables.isNode(elem, 'TEXTAREA')) {
			return true;
		}

		return false;
	}
	editables.isContentEditable = (elem) => {
		return elem.contentEditable === 'true';
	}
	editables.isBigTextEditable = (elem) => {
		return elem.contentEditable === 'true' || elem.type === 'textarea';
	}

	editables.isElement = (elem) => {
		if(elem && elem.ownerDocument && elem.ownerDocument.defaultView && elem.parentNode !== null) {
			if(elem instanceof elem.ownerDocument.defaultView.HTMLElement) {
				return true;
			}
		}
		return false;
	}

	editables.isNode = (elem, compare) => {
		return (elem.nodeName + '').toLowerCase() === compare.toLowerCase();
	}



	let logtmt;
	editables.pauseLoggingForJustABit = () => {
		terafm.pauseLogging = true;

		clearTimeout(logtmt);
		logtmt = setTimeout(function() {
			terafm.pauseLogging = false;
		}, 5);
	}

})(terafm.editables);

window.terafm = window.terafm || {};
terafm.defaults = {};

(function(defaults) {

	let enabled;
	let entries = new terafm.EntryList({uniqueEditables: true});

	terafm.initHandler.onInit(() => {
		enabled = terafm.options.get('resetEditablesBetweenRestorations');
	});

	defaults.update = (data) => { if(enabled) update(data) }
	defaults.add = (data) => { if(enabled) add(data) }
	defaults.restore = () => { if(enabled) restore() }

	function update(data) {
		entries.update(data);
	}
	function add(data) {
		entries.set(data);
	}

	function restore() {
		entries.each(entry => entry.restore({clone: false}));
	}
	
})(terafm.defaults);

window.terafm = window.terafm || {};
terafm.placeholders = {};

(function(placeholders) {

	let entries = new terafm.EntryList();

	placeholders.snapshot = (data) => snapshot(data);
	placeholders.restore = () => restore();

	function snapshot(data) {
		entries.set(data);
	}

	function restore() {
		entries.each(entry => {
			entry.getEditable().remHighlight();
			entry.restore({clone: false});
		}).clear();
	}
	
})(terafm.placeholders);
window.terafm = window.terafm || {};
terafm.validator = terafm.validator || {};

(function(validator) {
	'use strict';

	var validators = {
		elem: [],
		value: []
	}

	validator.validate = function(editable, type) {

		if(!(editable instanceof terafm.Editable)) return false;

		// Check only a specific type
		if(type) {
			return checkType(editable, type)

		// Check everything
		} else {
			for(type in validators) {
				if(!checkType(editable, type)) return false
			}
		}

		return true;
	}

	function checkType(editable, type) {
		for(var fi in validators[type]) {
			if(!validators[type][fi](editable)) {
				return false
			}
		}
		return true
	}

	// Password type check
	validators.elem.push(function(editable) {
		if(editable.el.nodeName.toLowerCase() === 'input' && editable.el.type === 'password' && terafm.options.get('savePasswords') !== true) {
			return false;
		}
		return true;
	})

	// Typio ignore field check
	validators.elem.push(function(editable) {
		return !editable.el.classList.contains('typioIgnoreField');
	})


	// Credit card value check
	validators.value.push(function(editable) {
		if(editable.isTextEditable()) {
			let value = editable.getValue(),
				isCard = /^[0-9\-\s]{8,22}$/.test(value);

			if(isCard && terafm.options.get('saveCreditCards') !== true) {
				return false;
			}
		}

		return true;
	})

	// Cannot be here because it'll be false on first focus and will trigger
	// weird stuff due to being invalid like broken saveindicator
	// Empty value check
	// validators.value.push(editable => {
	// 	if(editable.isTextEditable() && editable.getValue().length === 0) {
	// 		return false;
	// 	}
	// 	return true;
	// });


})(terafm.validator);
window.terafm = window.terafm || {};
terafm.ui = {};

(function(ui) {
	'use strict';

	let rootNode,
		shadowRootNode,
		innerShadowRootNode,

		iconFontInjected = false;

	// Some sites override the entire DOM sometimes, this will check if the rootNode
	// exists in the real DOM and append it if not
	ui.touch = function() {
		if(shadowRootNode) {
			var node = document.getElementById('terafm-shadow');

			if(!node) {
				document.body.appendChild(rootNode);

			} else if(node && !node.shadowRoot) {
				document.body.removeChild(node);
				document.body.appendChild(rootNode);
			}
		}
	}
	

	// Accepts dataObj.html or dataObj.path to template
	ui.inject = function(dataObj, replaceObj, callback) {

		// Make sure shadow root has been created
		if(!shadowRootNode) {
			createShadowRoot();
		}

		if(dataObj.loadIcons) {
			loadIconFont();
		}

		// Make replace arg optional
		if(!callback) {
			callback = replaceObj;
			replaceObj = undefined;
		}

		// If template was passed, fetch template content
		if(dataObj.path) {

			// Complete path will full extenison url
			dataObj.path = chrome.runtime.getURL(dataObj.path);

			var request = fetch(dataObj.path).then(response => response.text());

			request.then(function(text) {
				if(replaceObj) text = replacePlaceholders(text, replaceObj);
				let retnode = addToShadowRoot(text, dataObj.returnNode);
				callback(retnode);
			});

		// Html was passed, insert
		} else if(dataObj.html) {
			if(replaceObj) dataObj.html = replacePlaceholders(dataObj.html, replaceObj);
			let retnode = addToShadowRoot(dataObj.html, dataObj.returnNode);
			callback(retnode);
		}

	}

	ui.getShadowRootNode = function() {
		return shadowRootNode || false;
	}

	function replacePlaceholders(htmlStr, replObj) {
		Object.keys(replObj).map((key) => {
			htmlStr = htmlStr.replace(key, replObj[key]);
		})
		return htmlStr;
	}

	function addToShadowRoot(html, returnNode) {
		innerShadowRootNode.insertAdjacentHTML('beforeend', html);

		if(returnNode) {
			return innerShadowRootNode.querySelector(returnNode);
		}
	}

	function createShadowRoot() {
		document.body.insertAdjacentHTML('beforeend', '<div id="terafm-shadow"></div>');

		rootNode = document.getElementById('terafm-shadow');
		shadowRootNode = rootNode.attachShadow({mode: 'open'});

		let html = '';
		html += '<style>@import "' + chrome.runtime.getURL('css/contentShadowRoot.css') + '";</style>';
		html += '<div id="shadow-root"></div>';

		shadowRootNode.innerHTML = html;
		innerShadowRootNode = shadowRootNode.getElementById('shadow-root');
	}

	function loadIconFont() {
		if(iconFontInjected) return;
		
		let html = '<style>@import "' + chrome.runtime.getURL('fonts/typio/styles.css') + '";</style>';
		innerShadowRootNode.insertAdjacentHTML('afterbegin', html);

		var iconfont = new FontFace("typio", 'url('+ chrome.extension.getURL('fonts/typio/fonts/typio.woff') +')');
		document.fonts.add(iconfont);

		iconFontInjected = true;
	}

})(terafm.ui);
window.terafm = window.terafm || {};

(function() {
	'use strict';

	let storageData = {},
		storageKeys = [];

	terafm.cache = function(key, cacheFunction) {
		let keyId = storageKeys.indexOf(key);
		if(keyId !== -1) {
			return storageData[keyId]
		}

		keyId = storageKeys.push(key) -1;
		storageData[keyId] = cacheFunction();

		return storageData[keyId];
	};

	terafm.wipeCache = function() {
		storageData = {};
		storageKeys = [];
	}

})();

window.terafm = window.terafm || {};
terafm.Events = {};

(function(Events, ui, initHandler) {
	'use strict';

	let handlers = {},
		shadowRootNode;


	initHandler.onInit(function() {
		document.addEventListener('input', (e) => 		Events.trigger(e.type, e) );
		document.addEventListener('keyup', (e) => 		Events.trigger(e.type, e), true );
		document.addEventListener('contextmenu', (e) => Events.trigger(e.type, e) );
		document.addEventListener('mousedown', (e) => 	Events.trigger(e.type, e) );
		document.addEventListener('dblclick', (e) => 	Events.trigger(e.type, e) );
		document.addEventListener('click', (e) => 		Events.trigger(e.type, e) );
		document.addEventListener('focus', (e) =>		Events.trigger(e.type, e), true);
		document.addEventListener('blur', (e) =>		Events.trigger(e.type, e), true);
		document.addEventListener('change', (e) => 		Events.trigger(e.type, e), true);
		document.addEventListener('keydown', (e) => 	Events.trigger(e.type, e), true);

		window.addEventListener('message', function(msg) {
			if(msg.data.action && msg.data.action === 'terafmEventCatcher') {
				msg = msg.data.event;
				let target = terafm.resolvePath(msg.path[0]);

				if(target) {
					msg.path[0] = target;
					Events.trigger(msg.type, msg);
				}
			}
		})
	});


	Events.trigger = function(type, event) {
		if(type in handlers) {
			for(let h =0; h < handlers[type].length; ++h) {
				handlers[type][h](event);
			}
		}
	}


	Events.on = function(type, callback) {
		if(Array.isArray(type)) {
			for(let evt of type) {
				attachListener(evt, callback);
			}
		} else {
			attachListener(type, callback);
		}
	}

	function attachListener(type, callback) {
		if(!Array.isArray(handlers[type])) handlers[type] = [];
		handlers[type].push(callback);
	}

})(terafm.Events, terafm.ui, terafm.initHandler);
window.terafm = window.terafm || {};
terafm.keyboardShortcuts = {};

(function(keyboardShortcuts, Events) {
	'use strict';

	var pressed = [],
		combos = []

	keyboardShortcuts.on = function(keycombo, callback) {
		if(keycombo.length < 2 && keycombo[0] === '') return;
		
		var combo = JSON.parse(JSON.stringify(keycombo)).map(key => key.toLowerCase())
		combos.push({
			keys: combo,
			callback: callback
		})
	}

	keyboardShortcuts.printableKey = function(keycombo) {
		if(keycombo.length === 1 && keycombo[0] === '') {
			return '<span class="key disabled">disabled</span>'
		} else {
			return '<span class="key">' + keycombo.join('</span> <span class="key">') + '</span>';
		}
	}


	function checkForCombo(event) {

		// Loop through all key combos
		comboLoop:
		for(var combo of combos) {

			// Ignore if not the same number of keys pressed
			if(combo.keys.length !== pressed.length) {
				continue;
			}

			// Abort if not all keys match
			for(var key of combo.keys) {
				if(!pressed.includes(key)) {
					continue comboLoop;
				}
			}

			// It's a match!
			combo.callback(event)
			
			// Do not return; allow multiple identical combos (like Escape)
			// return true
		}
	}

	Events.on('keydown', function(e) {
		if(e.key === undefined) return;

		var lowcase = e.key.toLowerCase();

		if(pressed.indexOf(lowcase) === -1) {
			pressed.push(lowcase);
		}
		
		checkForCombo(e);
	})

	Events.on('keyup', function(e) {
		pressed = []

		// var pi = pressed.indexOf(e.key)
		// if(pi > 0) {
		// 	pressed = pressed.splice(pi, 0)
		// 	console.log('keyup', pressed)
		// }
	})


})(terafm.keyboardShortcuts, terafm.Events);

window.terafm = window.terafm || {};
terafm.blacklist = {};

(function(blacklist) {

	blacklist.getAll = function(callback) {
		getOptionData(callback)
	}

	blacklist.blockDomain = function(domain) {
		getOptionData(function(list) {
			if(isBlocked(list, domain) === false) {
				list.push(domain);
				saveList(list);
			}
		});
	}

	blacklist.unblock = function(url, callback) {
		getOptionData(function(list) {
			let index = isBlocked(list, url);
			if(index !== false) {
				list.splice(index, 1);
				saveList(list, callback);
			}
		});
	}

	blacklist.isBlocked = function(url, callback) {
		getOptionData(function(list) {
			callback(isBlocked(list, url) !== false );
		});
	}

	function isBlocked(list, url) {

		let index = list.indexOf(url);
		if(index !== -1) return index;

		try {
			// Full URL was passed
			let urlObj = new URL(url);

			// Check if hostname is blocked
			let index = list.indexOf(urlObj.hostname);
			if(index !== -1) return index;


			// Loop through items and compare individually
			for(let pi in list) {
				let pattern = list[pi];

				// Regex
				let regex = isRegex(pattern);
				if(regex !== false) {
					if(regex.test(url)) {
						return pi;
					}

					// Wildcard
				} else if(pattern.indexOf('*') !== -1) {
					let wild = wildcardCheck(pattern, urlObj.hostname);
					if(wild) return pi;
				}
			}

			// Domain was passed instead of URL
		} catch(e) {

			let domain = url;

			console.log(domain);

			let index = list.indexOf(domain);
			if(index !== -1) return index;

			for(let pi in list) {
				// Wildcard
				if(list[pi].indexOf('*') !== -1) {
					let wild = wildcardCheck(list[pi], domain);
					if(wild) return pi;
				}
			}
		}


		function wildcardCheck(pattern, hostname) {
			try {
				let regex = new RegExp( pattern.replace('.', '\.?').replace('*', '.*?') );
				if(regex.test(hostname)) {
					return true;
				}
			} catch(e){}
		}


		return false;
	}

	function isRegex(string) {
		if(string.length > 3 && string.indexOf('/') === 0 && string.slice(-1) === '/') {
			let tmp = string.substring(1, string.length-1);
			try {
				return new RegExp(tmp);
			} catch(e) {}
		}
		return false;
	}

	function saveList(list, callback) {
		chrome.storage.sync.set({'domainBlacklist': list}, function(set) {
			if(callback) callback();
		});
	}


	function getOptionData(callback) {
		chrome.storage.sync.get('domainBlacklist', function(data) {
			data = convertLegacy(data['domainBlacklist']);
			callback(data);
		})
	}


	// Old blacklist was saved as a big text field with one domain per line
	// If the old format is still used, this function converts the data
	// into array format.
	function convertLegacy(blob) {

		// Empty array or string or null
		if(!blob) {
			return [];

			// If string, convert to array
		} else if(typeof blob === 'string') {
			blob = (blob + "").split(/[\r|\n]+/g).filter(word => word.trim().length > 0);
			return blob;

			// Already array
		} else {
			return blob;
		}
	}

})(terafm.blacklist);
var terafm = window.terafm;

(function(db, options, initHandler) {
	'use strict';

	terafm.blacklist.isBlocked(window.location.href, function(blocked) {
		if(blocked) {
			terafm.isBlocked = true;
		
		} else {
			// Load extension options into memory
			options.loadFromChromeStorage(function() {
				
				// Initiate DB, populate in-memory storage
				db.init(function() {

					// Run init handlers
					initHandler.executeInitHandlers();
					console.log('Typio is ready!');
				});
			});
		}
	});


	// Messages from background.js
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'clearData') {
			if(terafm.isBlocked) return terafm.blockController.warn();
			db.deleteAllDataForDomain();
			terafm.toastController.create('Database cleared for ' + window.location.hostname);
		}
	});




	

})(terafm.db, terafm.options, terafm.initHandler);
(function(editableManager, db, saveIndicator, Events) {
	'use strict';

	terafm.initHandler.onInit(function() {

		// Force save before window is closed
		window.addEventListener('beforeunload', db.push);

		Events.on('input', e => changeHandler(e.path[0]));
		Events.on('change', e => changeHandler(e.path[0]));

		// Hack for facebook messenger
		if(['www.facebook.com', 'www.messenger.com'].includes(window.location.host)) {
			Events.on('keyup', function(e) {
				if(e.keyCode == 8 || e.keyCode == 46 || e.keyCode === 13) changeHandler(e.path[0]);
			});
		}

		// Watch for subtree changes (for contenteditables)
		let observer = new MutationObserver(mutation => changeHandler(mutation[0].target));
		Events.on('focus', e => {
			observer.disconnect();

			const editable = terafm.editables.get(e.path[0]);
			if(editable && editable.isContentEditable()) {
				observer.observe(editable.el, {childList: true, subtree: true});
			}
		});
	})

	function changeHandler(el) {

		if(terafm.pauseLogging) return;

		const editable = terafm.editables.get(el);

		if(!editable) return;

		editable.touch();

		if(terafm.validator.validate(editable)) {
			let entry = editable.getEntry();
			terafm.defaults.update(editable);

			if(false === editable.isEmpty()) entry.save();
			if(editable.type === 'radio') deleteRadioSiblings(editable);

		// Did not validate, delete if exists (if value validation failed)
		} else {
			terafm.db.del(editable.sessionId, editable.id);
		}
	}


	
	function deleteRadioSiblings(editable) {
		if(editable.type === 'radio' && editable.el.name) {
			
			const radios = editable.el.getRootNode().querySelectorAll('input[type="radio"][name="'+ editable.el.name +'"]');
			radios.forEach(function(rad) {
				if(rad !== editable.el) {
					let sib = new terafm.Editable(rad);
					db.del(editable.sessionId, sib.id);
				}
			});
		}
	}

})(terafm.editableManager, terafm.db, terafm.saveIndicator, terafm.Events);
window.terafm = window.terafm || {};

(function(Events, initHandler, editableManager) {
	"use strict";
	
	var target,
		focusTimeout;

	initHandler.onInit(function() {

		// Autofocus support
		setTimeout(function() {
			Events.trigger('focus', {path: [document.activeElement]});
		}, 100)
	});


	// Empty setTimeouts are used to make sure focus is always called after
	// blur on another input. This works by default but bubbling fake events
	// from encapsulators is slightly slower and causes the events to fire
	// out of order. This fixes the issue.

	Events.on('focus', function(e) {
		clearTimeout(focusTimeout)
		focusTimeout = setTimeout(function() {
			target = e.path[0];
			terafm.focusedEditable = terafm.editables.getTextEditable(e.path[0]);
			if(terafm.focusedEditable) Events.trigger('editable-text-focus', null)
		})
	});

	// Click is fallback to "focus" because shadow dom is being a dick and
	// will only bubble the first time. Tabbing still does not work correctly.
	/*
	Events.on('click', function(e) {

		// If focus has taken care of it, do nothing
		if(e.path[0] !== target) {
			var editable = terafm.editables.getTextEditable(e.path[0]);

			target = e.path[0];
			
			if(editable && !editable.is(terafm.focusedEditable)) {
				clearTimeout(focusTimeout)
				focusTimeout = setTimeout(function() {
					terafm.focusedEditable = editable;
					Events.trigger('editable-text-focus', null);
				})
			}
		}
	})
	*/

	Events.on('blur', function() {
		terafm.focusedEditable = null;
	})

})(terafm.Events, terafm.initHandler, terafm.editableManager);
window.terafm = window.terafm || {};

(function(options, saveIndicator, editableManager, Events, initHandler) {

	let vue;

	initHandler.onInit(function() {
		let isEnabled = options.get('saveIndicator') !== 'disable';

		if(isEnabled) {
			addEventListeners();
		}
	});


	function addEventListeners() {

		Events.on('db-save', () => {
			if(vue) vue.animate();
		});

		Events.on('editable-text-focus', function() {
			build(function() {
				if(!terafm.validator.validate(terafm.focusedEditable)) {
					return false;
				}

				vue.show();
				vue.animate();
			});
		});

		Events.on('blur', function() {
			if(vue) vue.hide();
		});
	}



	function build(callback) {
		if(vue) return callback && callback();

		terafm.ui.inject({
			html: '<div id="tmp-si-holder"></div>',
			returnNode: '#tmp-si-holder'
		}, function(rootnode) {
			makeVue(rootnode, () => {
				if(callback) callback();
			});
		});
	}

	function makeVue(rootnode, callback) {
		vue = new Vue({
			render() {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _vm._m(0)},
staticRenderFns: [function() {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"title":"This is the save indicator for Typio Form Recovery. Disable or change indicator style in the settings.","id":"save-indicator"}},[_c('div',{staticClass:"animator"})])}],
			el: rootnode,
			methods: {
				show: function() {
					this.isVisible = true;
					this.$el.classList.add('visible');
				},
				hide: function() {
					this.isVisible = false;
					this.$el.classList.remove('visible');
				},
				animate: function() {
					if(this.isVisible) {
						this.animator.style.animation = 'none';
						this.animator.offsetHeight; // Trigger reflow
						this.animator.style.animation = null;
					}
				},
			},
			data: function() {
				return {
					isVisible: true,
					animator: null
				}
			},
			mounted: function() {
				this.animator = this.$el.querySelector('.animator');

				this.$el.classList.add( options.get('saveIndicator') );

				let hexColor = options.get('saveIndicatorColor');
				this.$el.style.backgroundColor = hexColor;
				this.$el.style.color = hexColor;

				// setTimeout(callback, 200);
				// setTimeout(callback, 0);
				setTimeout(callback, 10);
				// callback();
			}
		});

	}

})(terafm.options, terafm.saveIndicator, terafm.editableManager, terafm.Events, terafm.initHandler);
window.terafm = window.terafm || {};

(function(Events, initHandler, ui, help, editableManager, options) {
	"use strict";

	let node,
		triggerAction,
		disabledEditables = [],
		iconDelayTimeout;

	initHandler.onInit(function() {
		if(options.get('quickAccessButtonEnabled')) {
			triggerAction = options.get('quickAccessButtonTrigger');
			addEventListeners();
		}
	});

	function addDeepEventListeners() {
		node.addEventListener('click', e => e.preventDefault() )
		node.addEventListener('mousedown', function(e) {
			e.preventDefault();
			e.stopPropagation();

			if(e.button !== 0) return;

			if(e.target.dataset.hide !== undefined) {
				hide();
				disableForEditable();
			} else {
				requestAnimationFrame(function() {
					terafm.wipeCache();
					terafm.quickAccessController.show(terafm.focusedEditable, {x: e.layerX, y: e.layerY});
				})

			}
		})
	}


	function addEventListeners() {
		if(triggerAction === 'focus') {
			Events.on('editable-text-focus', function() {
				if(terafm.validator.validate(terafm.focusedEditable, 'elem')) {
					delayShow();
				}
			});
		}

		// On editable double click
		if(triggerAction === 'doubleclick') {
			Events.on('dblclick', function() {
				if(terafm.validator.validate(terafm.focusedEditable, 'elem')) {
					delayShow();
				}
			})
		}

		Events.on(['blur'], function(e) {
			ui.touch();
			hide()
		});
	}

	function build(callback) {
		if(!node) {
			ui.inject({
				html: '<a id="quickAccessIcon" title="Open Typio Quick Access"><span data-hide="" title="Hide icon for this input this page load"></span></a>',
				returnNode: '#quickAccessIcon'
			}, function(res) {
				node = res;
				addDeepEventListeners();
				callback();
			})
		} else {
			callback();
		}
	}

	function hide() {
		if(node) node.style.display = 'none';
	}

	function disableForEditable() {
		if(terafm.focusedEditable) disabledEditables.push(terafm.focusedEditable);
	}

	function isDisabled(editable) {
		return disabledEditables.indexOf(editable) !== -1;
	}

	function delayShow() {
		clearTimeout(iconDelayTimeout);
		iconDelayTimeout = setTimeout(show, 50);
	}

	function show(trigger) {
		if(!terafm.focusedEditable) return;

		build(function() {
			var editable = terafm.focusedEditable
			var edStyle = getComputedStyle(editable.el);

			// Prevent flying icon in some cases
			if(edStyle.display !== 'none') {
				hide();
			}

			if(isDisabled(editable.el)) return;
			if(triggerAction === 'focus' && !(parseInt(edStyle.width) > 80 && parseInt(edStyle.height) > 10)) return;

			var rect = editable.rect(),
				pos = {
					x: rect.x + rect.width - 18,
					y: rect.y
				},
				offset = 4;

			// Calculate edge offset
			if(!editable.isBigTextEditable()) { // if(rect.height < 50 && rect.width > 150) {
				offset = (rect.height/2) - (18/2);
			}

			// Vertical scrollbar check
			if(editable.el.scrollHeight > editable.el.clientHeight || ['search', 'number'].includes(editable.type)) {
				pos.x -= 17;
			}

			pos.x -= (offset > 15 ? 15 : offset);
			pos.y += offset;

			node.style.top = pos.y + 'px';
			node.style.left = pos.x + 'px';
			node.style.display = 'block';
			
			ui.touch();
		})
	}

})(terafm.Events, terafm.initHandler, terafm.ui, terafm.helpers, terafm.editableManager, terafm.options);
window.terafm = window.terafm || {};
terafm.quickAccessController = {};

(function(controller, initHandler, options, keyboardShortcuts) {

	let vue;

	initHandler.onInit(function() {
		if(options.get('keybindEnabled')) {
			keyboardShortcuts.on(options.get('keybindOpenQuickAccess'), function(e) {
				if(e.preventDefault) {e.preventDefault(); e.stopPropagation();}

				// Only pass editable
				show(terafm.focusedEditable);
			});
		}
	});

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'openQuickAccess') {
			if(terafm.isBlocked) return terafm.blockController.warn();
			show(terafm.focusedEditable);
		}
	});

	controller.show = (...args) => show(...args);

	function show(editable, coord) {
		if(!terafm.focusedEditable) return terafm.toastController.create('Typio could not detect a focused input field. <a target="_blank" href="'+ chrome.runtime.getURL('html/faq.html#no-field-focus') +'">Read more.</a>');
		build(function() {
			vue.showAndPopulate(editable, coord);
		});
	}

	function build(callback) {
		if(vue) return callback && callback();

		terafm.ui.inject({
			html: '<div id="tmp-qa-holder"></div>',
			returnNode: '#tmp-qa-holder',
			loadIcons: true
		}, function(rootnode) {
			makeVue(rootnode, () => {
				if(callback) callback();
				setupKeyNav();
			});
		});
	}

	function makeVue(rootnode, callback) {

		Vue.component('entry-item', {
			render() {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return (_vm.itemType !== 'entry' || (_vm.itemType === 'entry' && _vm.entry.isTextType()))?_c('li',[_c('div',{class:[_vm.selected ? 'selected' : '', 'selectable', _vm.itemSize && 'size-' + _vm.itemSize, 'fill'],attrs:{"data-tooltip":_vm.itemTooltip},on:{"click":function($event){return _vm.commit()},"mouseenter":_vm.select,"mouseleave":_vm.unselect}},[(_vm.itemType === 'entry')?[(!_vm.isSess)?_c('span',{staticClass:"icon inner-fake-arrow icon-arrow-forward"},[_c('span',{attrs:{"data-tooltip":"Restore this entry (this entry was typed in another field)"}})]):_vm._e(),_vm._v(" "),_c('span',{domProps:{"innerHTML":_vm._s(_vm.entry.getPrintableValue({truncate: 80}))}})]:_vm._e(),_vm._v(" "),(_vm.itemType === 'link' && _vm.itemText)?[_vm._v("\n\t\t\t"+_vm._s(_vm.itemText)+"\n\t\t")]:_vm._e(),_vm._v(" "),(_vm.itemType === 'link' && _vm.itemImg)?[_c('span',{class:['icon', _vm.itemImg]})]:_vm._e()],2),_vm._v(" "),(_vm.isSess)?_c('div',{class:[_vm.singleSelected ? 'selected' : '', 'selectable', _vm.itemSize && 'size-' + _vm.itemSize, 'flex-icon', 'keyboard-ignore'],attrs:{"data-tooltip":"Restore just this entry."},on:{"click":function($event){return _vm.commit(true)},"mouseenter":_vm.singleSelect,"mouseleave":_vm.unselect}},[_vm._v("\n\t\t"+_vm._s(_vm.entry.session.length)+"\n\t\t"),_c('span',{staticClass:"icon icon-arrow-forward"})]):_vm._e()]):_vm._e()},
			props: ['itemType', 'action', 'isSess', 'itemText', 'itemTooltip', 'itemImg',		'entry', 'editable'],
			data: function() {
				return {
					selected: false,
					singleSelected: false
				}
			},
			methods: {
				select() {
					if(this.selected) return;
					this.$root.unselect();
					this.$root.select(this);
					this.selected = true;

					if(this.itemType === 'entry' && this.isSess) {
						let sess = this.entry.getSession();

						terafm.placeholders.snapshot(sess.getEditables());
						sess.setPlaceholders();
					} else if(this.itemType === 'entry') {
						terafm.placeholders.snapshot(this.editable);
						this.editable.applyPlaceholderEntry(this.entry);
					}
				},
				singleSelect() {
					if(this.singleSelected) return;
					this.$root.unselect();
					this.$root.select(this);
					this.singleSelected = true;

					terafm.placeholders.snapshot(this.editable);
					this.editable.applyPlaceholderEntry( this.entry );
				},
				unselect() {
					if(this.$root.currSel && this !== this.$root.currSel) {
						this.$root.currSel.unselect();
					}
					if(!this.selected && !this.singleSelected) return;

					this.selected = false;
					this.singleSelected = false;

					terafm.placeholders.restore();
				},
				commit(commitSingleFromSession) {
					if(this.itemType === 'link') {
						if(this.action === 'openRecovery') terafm.recoveryDialogController.open();
						else if(this.action === 'openKeyboardModal') terafm.keyboardShortcutController.showShortcutDialog();
						else if(this.action === 'disableTypio') terafm.blockController.block();
						else return;
					}

					terafm.placeholders.restore();
					terafm.defaults.restore();
					this.$root.hide();

					if(this.entry) {
						if(!this.isSess || commitSingleFromSession) {
							this.editable.applyEntry(this.entry);
						
						} else if(this.isSess) {
							this.entry.getSession().restore();
						}
					}
				},
			}
		});

		vue = new Vue({
			render() {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:[!_vm.isVisible ? 'hidden' : ''],attrs:{"id":"quickAccess"}},[(_vm.isEmpty)?_c('p',{staticStyle:{"margin":"10px","font-weight":"bold"}},[_vm._v("No entries found.")]):_vm._e(),_vm._v(" "),_vm._l((Object.keys(_vm.data)),function(dataType){return [_c('ul',{staticClass:"entry-list"},[_vm._l((_vm.data[dataType].entries),function(entry){return [_c('entry-item',{attrs:{"item-type":"entry","entry":entry,"editable":_vm.editable,"isSess":dataType === 'sess'}})]})],2)]}),_vm._v(" "),_c('ul',{staticClass:"footer"},[_c('entry-item',{attrs:{"item-type":"link","action":"openRecovery","item-text":"Browse all entries"}}),_vm._v(" "),_c('entry-item',{attrs:{"item-size":"short","item-tooltip":"Show keyboard shortcuts","item-type":"link","action":"openKeyboardModal","item-img":"icon-keyboard"}}),_vm._v(" "),_c('entry-item',{attrs:{"item-size":"short","item-tooltip":"Disable Typio on this domain","item-type":"link","action":"disableTypio","item-img":"icon-block"}})],1)],2)},
			el: rootnode,
			methods: {
				showAndPopulate: function(ed, coord) {
					if(!ed) throw new Error('No editable');

					let maxItems = 10;
					let data = { sess: [], recent: [] };

					if(terafm.options.get('qaGroupSessions')) {
						data.sess = terafm.db.getSessionsContainingEditable(terafm.focusedEditable.id, maxItems).getEntriesByEditable(terafm.focusedEditable.id, maxItems);
					}
					data.recent = terafm.db.getEntries(maxItems-data.sess.length, terafm.focusedEditable.id, function(entry) {
						return terafm.editables.isTextEditableType(entry.type);
					});

					this.data = data;
					this.isEmpty = (data.sess.length || data.recent.length) ? false : true;
					this.editable = ed;
					this.isVisible = true;

					requestAnimationFrame(() => {
						this.position(ed, coord);
					});
				},
				unselect: function() {
					if(!this.currSel) return;
					this.currSel.selected = false;
					this.currSel.singleSelected = false;
					this.currSel = false;
					terafm.placeholders.restore();
				},
				select: function(obj) {
					this.currSel = obj;
				},
				position: function(ed, coord) {
					let popupHeight = this.$el.clientHeight,
						popupWidth = this.$el.clientWidth;

					let pos = {x:0, y:0};
					let edrect = ed.rect();

					// Position by editable
					if(ed && !coord) {
						pos.x = edrect.x + edrect.width;
						pos.y = edrect.y + 6;

					// Position by click coord
					} else {
						pos = coord;
					}

					// If width overflows, position by editable instead
					if(pos.x + popupWidth > docWidth() && edrect.x - popupWidth > 0) {
						pos.x = edrect.x - popupWidth;
					}

					// If overflows height
					if(pos.y + popupHeight > docHeight()) {
						pos.y -= popupHeight;
					}

					this.$el.style = 'top: '+ pos.y +'px; left: '+ pos.x +'px;';

					function docHeight() {
						return document.documentElement.scrollHeight; //return Math.max(document.documentElement.scrollHeight, document.body.scrollHeight/*, document.documentElement.clientHeight*/);
					}
					function docWidth() {
						return document.documentElement.scrollWidth;
					}
				},
				hide: function() {
					this.unselect();
					this.isVisible = false;
				},
				abort() {
					this.hide();
					terafm.placeholders.restore();
				}
			},
			data: function() {
				return {
					isVisible: true,
					isEmpty: true,
					data: {},
					editable: false,
					isEmpty: false,
					currSel: false
				}
			}
		});
		terafm.Events.on('focus', vue.abort)

		if(callback) callback();
	}

	function setupKeyNav() {

		terafm.Events.on('mousedown', () => {
			if(vue.isVisible) {
				vue.abort();
			}
		});
		vue.$el.addEventListener('mousedown', (e) => e.stopPropagation());
		
		keyboardShortcuts.on(['ArrowDown'], function(e) {sel('next', e)});
		keyboardShortcuts.on(['ArrowRight'], function(e) {sel('next', e)});
		keyboardShortcuts.on(['ArrowUp'], function(e) {sel('prev', e)});
		keyboardShortcuts.on(['ArrowLeft'], function(e) {sel('prev', e)});
		
		function sel(direction, e) {
			if(vue.isVisible) {
				if(e.preventDefault) {e.preventDefault(); e.stopPropagation();}

				var sels = Array.prototype.slice.call(vue.$el.querySelectorAll('.selectable:not(.keyboard-ignore)')),
					currSel = vue.$el.querySelector('.selectable.selected'),
					currI = sels.indexOf(currSel),
					newSel;

				if(direction === 'prev') {
					if(currI < 1) {
						newSel = sels[sels.length-1]
					} else {
						newSel = sels[currI-1]
					}

				} else if(direction === 'next') {
					if(currI === -1 || currI === sels.length-1) {
						newSel = sels[0]
					} else {
						newSel = sels[currI+1]
					}
				}


				if(currSel) currSel.dispatchEvent(new Event('mouseleave'));
				newSel.dispatchEvent(new Event('mouseenter'));
			}
		}

		keyboardShortcuts.on(['Escape'], () => {
			if(vue.isVisible) {
				vue.abort();
			}
		});
		keyboardShortcuts.on([' '], (e) => {
			if(vue.isVisible && vue.currSel) {
				if(e.preventDefault) e.preventDefault();
				vue.currSel.commit();
			}
		});

		keyboardShortcuts.on(['shift', 'Delete'], () => {
			if(vue.isVisible && vue.currSel) {

				if(vue.currSel.isSess) {
					vue.currSel.entry.session.deleteAll();
				} else {
					vue.currSel.entry.delete();
				}

				const liEl = vue.currSel.$el;
				liEl.outerHTML = '';
			}
		})
	}


	function getSelectable(el) {
		if(el.classList.contains('selectable')) return el;
		else return el.closest('.selectable');
	}

})(terafm.quickAccessController, terafm.initHandler, terafm.options, terafm.keyboardShortcuts);
window.terafm = window.terafm || {};

terafm.keyboardShortcutController = {};

(function(keyboardShortcutController, db, editableManager, initHandler, options, keyboardShortcuts) {
	// 'use strict';

	let vue;

	keyboardShortcutController.showShortcutDialog = function() {
		showPopup();
	}

	// Open call popup
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'showKeyboardShortcuts') showPopup();
	});

	initHandler.onInit(function() {

		if(options.get('keybindEnabled')) {

			const keybindRestorePreviousSession = options.get('keybindRestorePreviousSession');
			if(keybindRestorePreviousSession.length) keyboardShortcuts.on(keybindRestorePreviousSession, function() {

				let sess;

				// First try and get prev sess for currently focused editable
				const currFocusEl = terafm.focusedEditable;
				if(currFocusEl) {
					const sessList = terafm.db.getSessionsContainingEditable(currFocusEl.id, 10);
					sess = sessList.getArray().pop();
				}

				// Fall back to global prev sess
				if(!sess) {
					sess = db.getLatestSession();
				}

				if(sess.length) {
					// Some editors have issues with programmatic manipulation when the editor has focus
					// Focus cannot always be restored (in iframes or shadow doms), but this is probably not an issue.
					const focusEl = document.activeElement;
					document.activeElement.blur();
					setTimeout(() => {
						focusEl.focus();
					}, 200);

					terafm.defaults.restore();
					sess.restore({flash: true});
					terafm.toastController.create('Restoring previous session')
				} else {
					terafm.toastController.create('Nothing to restore')
				}

			});
		}
	});

	function showPopup() {
		build(function() {
			vue.show();
		});
	}

	function build(callback) {
		if(vue) return callback();

		terafm.ui.inject({
			html: '<div id="tmp-holder"></div>',
			returnNode: '#tmp-holder',
			loadIcons: true
		}, function(rootnode) {
			makeVue(rootnode, callback);

			keyboardShortcuts.on(['Escape'], hide);
			function hide(e) {
				if(vue.visible) {
					if(e.preventDefault) {e.preventDefault(); e.stopPropagation();}
					vue.closeModal();
				}
			}
		});
	}

	function makeVue(rootnode, callback) {
		vue = new Vue({
			render() {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"modal-container",class:{'hidden': !_vm.visible},attrs:{"id":"keyboardShortcutPopup"},on:{"click":function($event){return _vm.backgroundClickHide($event)}}},[_c('div',{staticClass:"modal"},[_c('div',{staticClass:"modal-header"},[_c('p',{staticClass:"title"},[_vm._v("Typio Keyboard Shortcuts")]),_vm._v(" "),_c('button',{staticClass:"close icon-close",on:{"click":function($event){return _vm.closeModal()}}})]),_vm._v(" "),_c('div',{staticClass:"modal-content"},[(_vm.isDisabled)?_c('p',{staticClass:"error"},[_vm._v("You have disabled keyboard shortcuts in the options.")]):_vm._e(),_vm._v(" "),_c('div',{staticClass:"combo-group"},[_c('div',{staticClass:"combo"},[_c('p',{staticClass:"description"},[_vm._v("Open/Close recovery dialog")]),_vm._v(" "),_c('p',{staticClass:"keys",domProps:{"innerHTML":_vm._s(_vm.keybindToggleRecDiag)}})]),_vm._v(" "),_c('div',{staticClass:"combo"},[_c('p',{staticClass:"description"},[_vm._v("Restore previous session")]),_vm._v(" "),_c('p',{staticClass:"keys",domProps:{"innerHTML":_vm._s(_vm.keybindRestorePreviousSession)}})])]),_vm._v(" "),_c('div',{staticClass:"combo-group"},[_c('div',{staticClass:"combo"},[_c('p',{staticClass:"description"},[_vm._v("Open Quick Restore for focused field")]),_vm._v(" "),_c('p',{staticClass:"keys",domProps:{"innerHTML":_vm._s(_vm.keybindOpenQuickAccess)}})]),_vm._v(" "),_vm._m(0),_vm._v(" "),_vm._m(1),_vm._v(" "),_vm._m(2)]),_vm._v(" "),_c('div',{staticStyle:{"text-align":"center"}},[_c('a',{on:{"click":function($event){return _vm.openSettings();}}},[_vm._v("Change keyboard combinations in options")])])])])])},
staticRenderFns: [function() {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"combo"},[_c('p',{staticClass:"description"},[_vm._v("Navigate items")]),_vm._v(" "),_c('p',{staticClass:"keys"},[_c('span',{staticClass:"key"},[_vm._v("▲")]),_vm._v(" "),_c('span',{staticClass:"key"},[_vm._v("▼")])])])},function() {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"combo"},[_c('p',{staticClass:"description"},[_vm._v("Select item")]),_vm._v(" "),_c('p',{staticClass:"keys"},[_c('span',{staticClass:"key"},[_vm._v("Space")])])])},function() {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"combo"},[_c('p',{staticClass:"description"},[_vm._v("Delete item")]),_vm._v(" "),_c('p',{staticClass:"keys"},[_c('span',{staticClass:"key"},[_vm._v("Shift")]),_vm._v(" "),_c('span',{staticClass:"key"},[_vm._v("Delete")])])])}],
			el: rootnode,
			data: function() {
				return {
					visible: true,
					isDisabled : false,
					keybindToggleRecDiag : 'false',
					keybindRestorePreviousSession : 'false',
					keybindOpenQuickAccess : 'false'
				}
			},
			mounted: function() {
				this.fetchOptions();
			},
			methods: {
				show: function() {
					document.activeElement.blur();
					vue.visible = true;
				},
				fetchOptions: function() {
					this.isDisabled = !options.get('keybindEnabled'),
					this.keybindToggleRecDiag = terafm.keyboardShortcuts.printableKey(options.get('keybindToggleRecDiag')),
					this.keybindRestorePreviousSession = terafm.keyboardShortcuts.printableKey(options.get('keybindRestorePreviousSession')),
					this.keybindOpenQuickAccess = terafm.keyboardShortcuts.printableKey(options.get('keybindOpenQuickAccess'))
				},
				openSettings: function() {
					chrome.runtime.sendMessage({action: 'openSettings'});
				},
				closeModal: function() {
					this.visible = false;
				},
				backgroundClickHide: function(e) {
					if(e.path[0].classList.contains('modal-container')) this.closeModal();
				},
			}
		});

		if(callback) callback();
	}

})(terafm.keyboardShortcutController, terafm.db, terafm.editableManager, terafm.initHandler, terafm.options, terafm.keyboardShortcuts);

window.terafm = window.terafm || {};
terafm.recoveryDialogController = {};

(function(recoveryDialogController, recoveryDialog, db, help, editableManager, options, keyboardShortcuts, initHandler) {
	//'use strict';

	let vue;

	// Key comobo to open/close diag
	initHandler.onInit(function() {
		if(options.get('keybindEnabled')) {
			keyboardShortcuts.on(options.get('keybindToggleRecDiag'), function() {
				if(!vue) return build();
				if(vue.visible) {
					vue.hide();
				} else {
					vue.show();
				}
			});
		}

	});
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'openRecoveryDialog') show();
	});

	recoveryDialogController.open = () => show();

	function show() {
		if(terafm.isBlocked) return terafm.blockController.warn();
		if(vue) {
			vue.show();
		} else {
			build();
		}
	}

	function build(callback) {
		if(vue) return callback && callback();

		terafm.ui.inject({
			html: '<div id="tmp-dialog-holder"></div>',
			returnNode: '#tmp-dialog-holder',
			loadIcons: true
		}, function(rootnode) {
			makeVue(rootnode, callback);
		});
	}

	function makeVue(rootnode, callback) {
		vue = new Vue({
			render() {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"modal-container",class:{'hidden': !_vm.visible},attrs:{"id":"recovery-dialog"},on:{"click":function($event){return _vm.backgroundClickHide($event)}}},[_c('div',{staticClass:"modal"},[_c('div',{staticClass:"header"},[_c('div',{staticClass:"top-bar"},[_c('p',[_vm._v("Typio Form Recovery")]),_vm._v(" "),_c('button',{staticClass:"icon-close",on:{"click":function($event){return _vm.hide()}}})]),_vm._v(" "),_c('div',{staticClass:"primary"},[_c('div',{staticClass:"left"},[_vm._v("\n\t\t\t\t\tRecover "+_vm._s(_vm.hostname)+"\n\t\t\t\t")]),_vm._v(" "),_c('button',{staticClass:"toolbar-icon",on:{"click":function($event){return _vm.disableSite()}}},[_c('span',{staticClass:"icon-block"}),_vm._v("Disable on this site")]),_vm._v(" "),_c('button',{staticClass:"toolbar-icon",on:{"click":function($event){return _vm.openOptions()}}},[_c('span',{staticClass:"icon-gear"}),_vm._v("Open settings")])])]),_vm._v(" "),_c('div',{staticClass:"panes"},[_c('div',{staticClass:"left"},[_c('div',{staticClass:"header"},[_c('div',{staticClass:"filter-box"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.filterText),expression:"filterText"}],staticClass:"filter-input typioIgnoreField",attrs:{"type":"text","placeholder":"Filter entries"},domProps:{"value":(_vm.filterText)},on:{"input":[function($event){if($event.target.composing){ return; }_vm.filterText=$event.target.value},function($event){return _vm.populate(true)}]}}),_vm._v(" "),_c('div',{staticClass:"chk-label"},[_c('div',{staticClass:"pretty-chk"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.filterShowTextOnly),expression:"filterShowTextOnly"}],staticClass:"typioIgnoreField",attrs:{"type":"checkbox","id":"chk-hide-small-entries"},domProps:{"checked":Array.isArray(_vm.filterShowTextOnly)?_vm._i(_vm.filterShowTextOnly,null)>-1:(_vm.filterShowTextOnly)},on:{"change":[function($event){var $$a=_vm.filterShowTextOnly,$$el=$event.target,$$c=$$el.checked?(true):(false);if(Array.isArray($$a)){var $$v=null,$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.filterShowTextOnly=$$a.concat([$$v]))}else{$$i>-1&&(_vm.filterShowTextOnly=$$a.slice(0,$$i).concat($$a.slice($$i+1)))}}else{_vm.filterShowTextOnly=$$c}},function($event){return _vm.updateOptsfilterShowTextOnly()}]}}),_vm._v(" "),_c('div',{staticClass:"fake-chk"})]),_vm._v(" "),_c('label',{attrs:{"for":"chk-hide-small-entries"}},[_vm._v("Hide non-text entries")])]),_vm._v(" "),_c('span',{staticClass:"icon icon-search"})]),_vm._v(" "),(_vm.filteredCount)?_c('p',{staticClass:"filter-warning"},[_vm._v(_vm._s(_vm.filteredCount)+" entries hidden - "),_c('a',{on:{"click":function($event){_vm.resetFilters(); _vm.populate(true);}}},[_vm._v("clear filters")])]):_vm._e()]),_vm._v(" "),_c('div',{staticClass:"session-data"},[(_vm.sesslist && _vm.sesslist.length < 1)?[_c('p',[_vm._v("No entries found.")])]:_vm._e(),_vm._v(" "),(!_vm.sesslist)?[_c('p',[_vm._v("Loading entries...")])]:_vm._e(),_vm._v(" "),(_vm.sesslist !== false)?_c('div',[_vm._l((_vm.sesslist.getArray().reverse()),function(sess){return [(sess.length)?_c('p',{staticClass:"date-stamp"},[_vm._v("\n\t\t\t\t\t\t\t\t"+_vm._s(sess.prettyDate())+"\n\t\t\t\t\t\t\t\t"),(sess.getFirstEntry().originURL)?[_vm._v("\n\t\t\t\t\t\t\t\t\t · \n\t\t\t\t\t\t\t\t\t"),_c('a',{attrs:{"href":sess.getFirstEntry().originURL,"title":sess.getFirstEntry().originURL}},[_vm._v("view page")])]:_vm._e()],2):_vm._e(),_vm._v(" "),(sess.length)?_c('ul',{staticClass:"card-1"},_vm._l((sess.entries),function(entry){return _c('li',{attrs:{"data-session-id":entry.sessionId,"data-editable-id":entry.editableId},on:{"click":function($event){return _vm.setEntry($event)}}},[_c('p',{domProps:{"innerHTML":_vm._s(entry.getPrintableValue({truncate: 300}))}}),_vm._v(" "),_c('div',{staticClass:"meta"},[_c('div',{staticClass:"left"},[(entry.hasEditable())?_c('span',{staticClass:"status ok",attrs:{"title":"This input entry can be automatically restored to its original input field."}},[_vm._v("Input field found")]):_vm._e(),_vm._v(" "),(!entry.hasEditable())?_c('span',{staticClass:"status bad",attrs:{"title":"The input field the entry was typed in cannot be found on the current page. Either the field does not exist, or it cannot be found in the same place (path has changed). You can manually restore the entry by copying it."}},[_vm._v("Cannot be auto-restored")]):_vm._e()]),_vm._v(" "),_c('div',{staticClass:"right"},[_c('a',{staticClass:"delete",class:_vm.delConfirmEntry === entry ? 'confirm' : '',on:{"click":function($event){return _vm.deleteEntry($event)}}},[_vm._v(_vm._s(_vm.delConfirmEntry === entry ? 'Click to confirm' : 'Delete'))])])])])}),0):_vm._e()]})],2):_vm._e()],2)]),_vm._v(" "),_c('div',{staticClass:"right"},[_c('div',{staticClass:"page page-default",class:[(_vm.page === 'default' || !_vm.page) ? 'page-current' : '' ]},[_c('div',{staticClass:"center"},[_c('span',{staticClass:"icon icon-cloud"}),_vm._v(" "),_c('p',{staticClass:"bold"},[_vm._v("Select an entry to the left.")]),_vm._v(" "),_c('p',[_vm._v("Typio has saved "),_c('b',[_vm._v(_vm._s(_vm.stats.countTotEntries)+" entries")]),_vm._v(" in "),_c('b',[_vm._v(_vm._s(_vm.stats.countTotSessions)+" sessions")]),_vm._v(" with"),_c('br'),_vm._v("a total size of "),_c('b',[_vm._v(_vm._s(_vm.stats.countTotSize)+" megabytes")]),_vm._v(" for this domain.")]),_vm._v(" "),_c('p',[_vm._v("Psst. Did you know about the "),_c('a',{on:{"click":function($event){return _vm.openKeyboardShortcuts()}}},[_vm._v("keyboard shortcuts")]),_vm._v("?")])])]),_vm._v(" "),(_vm.currEntry)?_c('div',{staticClass:"page page-entry",class:[(_vm.page === 'entry') ? 'page-current' : '' ]},[_c('div',{staticClass:"entry-header"},[(_vm.currEntry.hasEditable())?[_c('button',{staticClass:"btn btn-primary",on:{"click":function($event){return _vm.restoreSession()}}},[_vm._v("Restore session")]),_vm._v(" "),_c('button',{staticClass:"btn btn-flat",on:{"click":function($event){return _vm.restoreEntry()}}},[_vm._v("Restore only this")])]:_vm._e(),_vm._v(" "),(_vm.currEntry.type === 'contenteditable')?[_c('div',{staticClass:"btn-drop-container",staticStyle:{"float":"right"},on:{"click":function($event){$event.path[0].closest('.btn-drop-container').classList.toggle('open')}}},[_c('button',{staticClass:"btn",class:[!_vm.currEntry.hasEditable() ? 'btn-primary' : 'btn-flat' ]},[_vm._v("Copy▾")]),_vm._v(" "),_c('ul',{staticClass:"btn-drop"},[_c('li',{on:{"click":function($event){return _vm.copyEntry('plaintext')}}},[_vm._v("Copy plain text")]),_vm._v(" "),_c('li',{on:{"click":function($event){return _vm.copyEntry('formatting')}}},[_vm._v("Copy with formatting")])])])]:[_c('button',{staticClass:"btn",class:[!_vm.currEntry.hasEditable() ? 'btn-primary' : 'btn-flat' ],staticStyle:{"float":"right"},on:{"click":function($event){return _vm.copyEntry('plaintext')}}},[_vm._v("Copy")])],_vm._v(" "),(!_vm.currEntry.hasEditable())?_c('p',{staticClass:"message-warn"},[_c('span',{staticClass:"icon-info"}),_vm._v(" This entry cannot be restored automatically. "),_c('a',{attrs:{"target":"_blank","href":_vm.noAutoRestoreHelpLink}},[_vm._v("Why?")])]):_vm._e()],2),_vm._v(" "),_c('div',{staticClass:"entry-text card-1",attrs:{"id":"entry-text"},domProps:{"innerHTML":_vm._s(_vm.currEntry.getPrintableValue({retainLineBreaks: true}))}}),_vm._v(" "),_c('div',{staticClass:"entry-meta card-1",attrs:{"id":"entry-path"}},[_vm._v("\n\t\t\t\t\t\t"+_vm._s(_vm.currEntry.path)+"   "+_vm._s(_vm.currEntry.type)+"\n\t\t\t\t\t")])]):_vm._e()])])])])},
			el: rootnode,
			methods: {
				hide: function() {
					this.visible = false;
				},
				backgroundClickHide: function(e) {
					if(e.path[0].classList.contains('modal-container')) this.hide();
				},
				show: function() {
					if(this.visible) return;
					this.visible = true;
					this.populate();
				},
				setEntry: function(e) {
					let target = e.path[0];
					if(!target.matches('li')) target = target.closest('li');

					this.currEntry = this.sesslist.getEntry(target.dataset.sessionId, target.dataset.editableId);
					this.page = 'entry';

					if(this.selectedListItem) this.selectedListItem.classList.remove('selected');
					this.selectedListItem = target;
					this.selectedListItem.classList.add('selected');
				},
				setDefaultPage: function() {
					this.currEntry = null;
					this.page = 'default';
					if(this.selectedListItem) {
						this.selectedListItem.classList.remove('selected');
						this.selectedListItem = null;
					}
				},

				// Callback for failures?
				restoreSession: function() {
					if(!this.currEntry) return;
					terafm.defaults.restore();
					// Don't use this.currEntry.getSession(), entries could be filtered out!
					const sess = db.getSession(this.currEntry.sessionId);
					sess.restore({flash: true});
					terafm.toastController.create('Session restored.');
					this.hide();
				},
				restoreEntry: function() {
					if(!this.currEntry) return;
					terafm.defaults.restore();
					this.currEntry.restore({flash: true});
					terafm.toastController.create('Entry restored.');
					this.hide();
				},

				populate: function(opts = {scrollTop: false}) {
					this.setDefaultPage();

					db.fetch().then(() => {
						terafm.wipeCache();
						this.sesslist = db.getSessions();

						this.stats.countTotSessions = this.sesslist.length;
						this.stats.countTotEntries = this.sesslist.countEntries();
						terafm.db.getDomainSize().then(bytes => this.stats.countTotSize = Number(bytes/1024/1024).toFixed(2));

						if(this.filterShowTextOnly || this.filterText.length > 1) {
							this.sesslist = this.sesslist.filterEntries(entry => {
								if(this.filterText.length > 1) {
									if(entry.value.toLowerCase().indexOf(this.filterText.toLowerCase()) === -1) return null;
								}

								if(this.filterShowTextOnly) {
									if(!entry.isTextType()) return null;
								}
							});
							this.filteredCount = this.stats.countTotEntries - this.sesslist.countEntries();
						} else {
							this.filteredCount = 0;
						}
						
						if(opts.scrollTop) this.scrollTop();

					});
				},
				scrollTop: function() {
					this.$el.querySelector('.session-data').scrollTop = 0;
				},
				updateOptsfilterShowTextOnly: function() {
					this.populate();
					options.set('hideSmallEntries', this.filterShowTextOnly);
				},
				resetFilters: function() {
					this.filterText = '';
					this.filterShowTextOnly = false;
				},

				deleteEntry: function(e) {
					let target = e.path[0], li, entry;
					if(!target.matches('.delete')) target = target.closest('.delete');
					li = target.closest('li');
					entry = this.sesslist.getEntry(li.dataset.sessionId, li.dataset.editableId);

					if(!entry) return;
					clearTimeout(this.tmpDelTimeout);

					if(this.delConfirmEntry === entry) {
						this.sesslist.deleteEntry(li.dataset.sessionId, li.dataset.editableId, () => {
							this.populate();
							this.delConfirmEntry = false;
						});

					} else {
						this.delConfirmEntry = entry;
						this.$forceUpdate();

						this.tmpDelTimeout = setTimeout(() => {
							this.delConfirmEntry = false;
							this.$forceUpdate();
						}, 4000);
					}

					e.stopPropagation();
					return;



					if(!target.classList.contains('confirm')) {
						target.classList.add('confirm');
						target.querySelector('.text').innerText = 'Click to confirm';
						
						setTimeout(function() {
							target.classList.remove('confirm');
							target.querySelector('.text').innerText = 'Delete';
						}, 4000);
					} else {
						let li = target.closest('li');

						this.sesslist.deleteEntry(li.dataset.sessionId, li.dataset.editableId, () => {
							this.populate();

							// Vue will re-use other elements and change the text in them
							// instead of creating new ones, so the make sure the .confirm class
							// is removed if the li element was re-used
							let delLink = li && li.querySelector('.meta .delete.confirm');
							if(delLink) delLink.classList.remove('confirm');
						});
					}
				},

				openKeyboardShortcuts: function() {
					this.hide();
					terafm.keyboardShortcutController.showShortcutDialog();
				},

				copyEntry: function(format) {
					if(!this.currEntry) return;

					if(format === 'plaintext') {
						terafm.help.copyToClipboard(this.currEntry.getValue({stripTags: true, trim: true}));
						terafm.toastController.create('Copied plaintext to clipboard.');

					} else if(format === 'formatting') {
						terafm.help.copyToClipboard(this.currEntry.getValue({trim: true}));
						terafm.toastController.create('Copied text with formatting to clipboard.');
					}

				},

				openOptions: function() {
					chrome.runtime.sendMessage({action: 'openSettings'});
				},
				disableSite: function() {
					if(terafm.blockController.block()) this.hide();
				},
			},
			data: {
				visible: true,
				hostname: window.location.hostname,
				page: 'default',
				selectedListItem: null,

				sesslist: false,
				currEntry: null,

				filteredCount: 0,
				filterShowTextOnly: options.get('hideSmallEntries'),
				filterText: '',
				noAutoRestoreHelpLink: chrome.runtime.getURL('html/faq.html#no-auto-restore'),

				delConfirmItem: false,

				stats: {
					countTotSessions: 0,
					countTotEntries: 0,
					countTotSize: 0
				}
			},
			mounted: function() {
				document.activeElement.blur();
				this.populate();
			}
		});

		keyboardShortcuts.on(['Escape'], function() {
			vue.hide();
		});

		if(callback) callback();
	}

})(terafm.recoveryDialogController, terafm.recoveryDialog, terafm.db, terafm.help, terafm.editableManager, terafm.options, terafm.keyboardShortcuts, terafm.initHandler);

window.terafm = window.terafm || {};
terafm.toastController = {};

(function(controller, ui) {

	let vue;

	controller.create = function(message) {
		build(function() {
			vue.showMessage(message);
		});
	}


	function build(callback) {
		if(vue) return callback && callback();

		terafm.ui.inject({
			html: '<div id="tmp-toast-holder"></div>',
			returnNode: '#tmp-toast-holder'
		}, function(rootnode) {
			makeVue(rootnode, () => {
				if(callback) callback();
			});
		});
	}

	function makeVue(rootnode, callback) {

		vue = new Vue({
			render() {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:[_vm.isVisible ? 'visible' : ''],attrs:{"id":"toast-container"}},[_c('p',{staticClass:"message",domProps:{"innerHTML":_vm._s(_vm.message)}})])},
			el: rootnode,
			methods: {
				showMessage: function(message) {

					if(this.isVisible) {
						this.isVisible = false;
						clearTimeout(this.timeout);
						setTimeout(() => {
							this.showMessage(message);
						}, 100);
						return false;
					}

					this.message = message;
					this.isVisible = true;

					clearTimeout(this.timeout);
					this.timeout = setTimeout(() => {
						this.isVisible = false;
					}, 4000);
				},
			},
			data: function() {
				return {
					message: '',
					isVisible: false,
					timeout: null
				}
			}
		});

		if(callback) requestAnimationFrame(() => requestAnimationFrame(callback));
	}

})(terafm.toastController, terafm.ui)
window.terafm = window.terafm || {};
terafm.blockController = {};

(function(controller) {

	controller.block = function() {
		let ok = confirm(`Disable Typio completely on ${window.location.hostname}? The page will be refreshed.`);
		if(ok) {
			terafm.blacklist.blockDomain(window.location.hostname);
			setTimeout(() => window.location.reload(), 50); // Give it some time to block
		}
		return ok;
	}

	controller.warn = function() {
		var enable = confirm(`Uh oh! The action cannot be performed because you have disabled Typio on this domain.\n\nDo you want to enable Typio again? The page will be refreshed.`);
		if(enable) {
			terafm.blacklist.unblock(location.href, function() {
				location.reload();
			})
		};
	}

})(terafm.blockController)
