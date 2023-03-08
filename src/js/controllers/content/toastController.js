import ui from '../../modules/ui';
import ToastComponent from '../../vue/backendApp/components/Toast.vue';
import Vue, { createApp, h } from 'vue';
let controller = {};

let vue;

controller.create = function(message) {
	build(function() {
		vue.showMessage(message);
	});
}


function build(callback) {
	if(vue) return callback && callback();

	ui.inject({
		html: '<div id="tmp-toast-holder"></div>',
		returnNode: '#tmp-toast-holder'
	}, function(rootnode) {
		makeVue(rootnode, () => {
			if(callback) callback();
		});
	});
}

function makeVue(rootnode, callback) {

	vue = createApp({
		render() { return h(ToastComponent)}
	}).mount(rootnode)

	if(callback) requestAnimationFrame(() => requestAnimationFrame(callback));
}

export default controller;