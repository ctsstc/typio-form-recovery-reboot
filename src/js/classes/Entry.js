import Editable from './Editable';
import Options from '../modules/options/options';
import Helpers from '../modules/Helpers';
import Editables from '../modules/Editables';
import SessionHandler from '../modules/SessionHandler';

export default class Entry {
	constructor(arg, opts = {resolveUncheckedRadios: false, context: null}) {
		this.meta = {};

		// Make Entry from editable
		if(arg instanceof Editable) {

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
			if(sel) return new Editable(sel);
		}
		else {
			return ed;
		}
	}

	copy(opts) {
		// return new Entry(this, opts);
		return new Entry(this.getEditable(), {...opts, context: this});
	}

	isTextType() {
		return Editables.isTextEditableType(this.type);
	}

	isContentEditableType() {
		return Editables.isContentEditableType(this.type);
	}

	getValue(opts = {encodeHTMLEntities: false, decodeHTMLEntities: false, stripTags: false, truncate: false, trim: false, trimNewLines: false, newLineToBr: false, brToNewLine: false,}) {

		var str = this.value;

		if(opts.stripTags) {
			str = Helpers.stripTags(str);
		}

		if(opts.encodeHTMLEntities) {
			str = Helpers.encodeHTMLEntities(str);
		}

		if(opts.decodeHTMLEntities) {
			str = Helpers.decodeHTMLEntities(Helpers.stripTags(str));
		}

		if(typeof opts.truncate === 'number' && str.length > opts.truncate) {
			str = str.substring(0, opts.truncate) + '...';
		}

		if(opts.newLineToBr) {
			str = str.replace(/[\r\n]/gm, '<br/>');
		}

		if(opts.brToNewLine) {
			str = str.replace(/<br[^>]*>/gi, "\r\n");
		}

		if(opts.trim) {
			str = Helpers.trim(str);
		}

		if(opts.trimNewLines) {
			str = Helpers.trimNewLines(str);
		}

		return str;
	}

	getPrintableValue(opts) {
		let value = '';
		let entry = this;

		if(entry.type === 'radio' && entry.meta.meta) {
			value += Helpers.encodeHTMLEntities(entry.meta.meta); // Meta contains name:value, we don't care about the "checked" value here (its always 1 because its selected)

		} else if(entry.type === 'checkbox' && entry.meta) {
			value += Helpers.encodeHTMLEntities(entry.meta.meta) + (entry.value == '1' ? ' (checked)' : ' (unchecked)');

		} else {
			if(entry.meta.meta) {
				value = Helpers.encodeHTMLEntities(entry.meta.meta) + ': ';
			}

			if(entry.type === 'contenteditable') {
				value += this.getValue({stripTags: true, encodeHTMLEntities: true, trim: true, ...opts});
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

	restore(opts = { flash: false, clone: true }, dbRef=null) {
		let editable = this.getEditable();

		if(editable) {
			editable.applyEntry(this);
			if(opts.flash) editable.flashHighlight();
		}

		if(opts.clone === true && dbRef && Options.get('cloneOnRestore') === true) {
			this.cloneToCurrentSession(dbRef);
		}
	}

	cloneToCurrentSession(dbRef) {
		this.sessionId = SessionHandler.getGlobalSessionId();
		dbRef.saveEntry(this);
	}

	getSession() {
		return this.session;
	}

	canBeAutoRestored() {
		return this.hasEditable() && !this.isContentEditableType();
	}

	hasEditable() {
		return !!this.getEditable();
	}

	getEditable() {
		if(this._editable !== undefined) {
			return this._editable;
		} else {
			this._editable = Editables.get(this.path);
			return this._editable;
		}
	}
}