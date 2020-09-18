import EntryList from '../classes/EntryList';

import Options from './options/options';
import initHandler from './initHandler';

let defaults = {};
let enabled;
let entries = new EntryList({uniqueEditables: true});

initHandler.onInit(() => {
	enabled = Options.get('resetEditablesBetweenRestorations');
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

export default defaults;