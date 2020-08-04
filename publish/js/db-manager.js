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





;(function() {

	// Don't store in vue because it'll be vuey-fied and slow
	let buckets = [];

	let vue = new Vue({
		render() {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('h1',[_vm._v("These features are experimental.")]),_vm._v(" "),_c('p',[_vm._v("The features on this page have not gone through proper testing and might not function as expected. Use at your own risk.")]),_vm._v(" "),_c('br'),_c('br'),_c('br'),_vm._v(" "),_vm._m(0),_vm._v(" "),_c('button',{on:{"click":_vm.exportToFile}},[_vm._v("Export database to file")]),_vm._v(" "),_c('br'),_c('br'),_c('br'),_vm._v(" "),_vm._m(1),_vm._v(" "),_c('input',{ref:"fileToImport",attrs:{"type":"file","id":"selectFiles","value":"Import"}}),_vm._v(" "),_c('button',{on:{"click":_vm.importFromFile}},[_vm._v("Import file")]),_vm._v(" "),_c('br'),_c('br'),_c('br'),_vm._v(" "),_vm._m(2),_vm._v(" "),_c('p',[_vm._v("Please note that any existing data for the new domain will be replaced with the old - the data will *not* be merged.")]),_vm._v(" "),_c('form',{on:{"submit":_vm.changeDomainName}},[_c('label',{attrs:{"for":"domainNameChangeInput"}},[_vm._v("Change from:")]),_vm._v(" "),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.domainChangeFrom),expression:"domainChangeFrom"}],staticStyle:{"width":"200px"},attrs:{"id":"domainNameChangeInput","list":"domainDatalist","placeholder":"Current domain name"},domProps:{"value":(_vm.domainChangeFrom)},on:{"input":function($event){if($event.target.composing){ return; }_vm.domainChangeFrom=$event.target.value}}}),_vm._v(" "),_c('datalist',{attrs:{"id":"domainDatalist"}},_vm._l((_vm.domainList),function(domain){return _c('option',{domProps:{"value":domain.domainName}})}),0),_vm._v("\n\t\tto:\n\t\t"),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.domainChangeTo),expression:"domainChangeTo"}],staticStyle:{"width":"200px"},attrs:{"type":"text","placeholder":"New domain name"},domProps:{"value":(_vm.domainChangeTo)},on:{"input":function($event){if($event.target.composing){ return; }_vm.domainChangeTo=$event.target.value}}}),_vm._v(" "),_c('button',[_vm._v("Change")])])])},
staticRenderFns: [function() {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('p',[_c('b',[_vm._v("Export database")])])},function() {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('p',[_c('b',[_vm._v("Import database backup")])])},function() {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('p',[_c('b',[_vm._v("Handle domain name change")])])}],
		el: document.getElementById('root'),
		data() {
			return {
				hasBuckets: false,
				entryFilter: '',
				entryList: null,
				maxResults: 10,

				domainChangeFrom: null,
				domainChangeTo: null,
			}
		},
		mounted() {
			this.loadBuckets();
		},
		methods: {
			loadBuckets() {
				this.hasBuckets = false;
				chrome.storage.local.get(null, storage => {
					let doms = Object.keys(storage);
					buckets = [];
					for(let dom of doms) {
						if(dom.indexOf('###') === 0) {
							buckets.push(new terafm.StorageBucket(dom, {[dom]: storage[dom]}));
						}
					}
					this.hasBuckets = true;
				});
			},
			importFromFile() {
				const files = this.$refs.fileToImport.files;

				if (files.length !== 1) {
					return alert('Please select a file to import.');
				}

				if(!confirm("Importing a database will OVERRIDE the existing database. This is non-reversible. Do you want to continue?")) {
					return false;
				}

				const fileReader = new FileReader();

				fileReader.onload = function(e) {
					const arr = JSON.parse(e.target.result);

					if(arr.length) {
						let write = {};
						for(const domain of arr) {
							if(domain.hasOwnProperty('domainId') && domain.hasOwnProperty('context')) {
								write[domain.domainId] = domain;
							}
						}
						chrome.storage.local.set(write)
						alert('File was successfully imported.');
					}
				}

				fileReader.readAsText(files.item(0));
			},
			exportToFile() {
				chrome.permissions.request({
					permissions: ['downloads'],
				}, function(granted) {
					// The callback argument will be true if the user granted the permissions.
					if (granted) {
						const blob = new Blob([JSON.stringify(buckets)], {type: "application/json"});
						const url = URL.createObjectURL(blob);

						const d = new Date();
						const filename = 'Typio Export ' + d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear() + '.json';
						chrome.downloads.download({
							url: url,
							filename: filename
						});
					}
				});
			},
			changeDomainName(e) {
				e.preventDefault();

				if(this.domainExists(this.domainChangeFrom) !== true) {
					return alert('There is no data saved for the selected domain. Did you spell it correctly?');
				}
				if(this.isValidDomain(this.domainChangeTo) !== true) {
					return alert('The new domain name is not valid.');
				}

				const newDomainId = '###' + this.domainChangeTo;

				const bucket = buckets.filter(bucket => {
					return bucket.domainId === '###' + this.domainChangeFrom
				})[0];

				chrome.storage.local.get(bucket.domainId, copy => {
					copy[newDomainId] = copy[bucket.domainId];
					delete copy[bucket.domainId];

					chrome.storage.local.set(copy, () => {
						chrome.storage.local.remove(bucket.domainId);
						alert(this.domainChangeFrom + ' has been renamed to ' + this.domainChangeTo);
						this.loadBuckets();

						this.domainChangeFrom = null;
						this.domainChangeTo = null;
					});
				});

			},
			applyEntryFilter() {
				if(this.entryFilter) {
					let max = this.maxResults;

					let res = [];
					for(let buck of buckets) {
						if(max < 1) break;

						// Todo: Figure out why search does not return results correctly (max 1 result per domain?)
						let list = buck.getEntries(null, null, entry => {
							return entry.valueContains(this.entryFilter) !== -1;
						});
						list.domain = buck.domainId;
						console.log(list.length);
						max -= list.length;
						res.push(list);
					}
					console.log(res);

					this.entryList = res;
				} else {
					this.entryList = [buck.getEntries(null, null, entry => {
						return entry.valueContains(this.entryFilter) !== -1;
					})];
				}

			},
			domainExists(needle) {
				return this.domainList.filter(domain => {
					return domain.domainName === needle
				}).length > 0;
			},
			isValidDomain(domain) {
				return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(domain);
			},
		},
		computed: {
			buckets() {
				return this.hasBuckets ? buckets : null;
			},
			domainList() {
				const list = [];
				for(const bucketIndex in this.buckets) {
					const bucket = buckets[bucketIndex];

					list.push({
						domainName: bucket.domainId.replace('###', ''),
						domainId: bucket.domainId,
						index: bucketIndex,
					})
				}

				return list;
			}
		},
	});
})();