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
			...{render: function render() {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:[_vm.isVisible ? 'visible' : ''],attrs:{"id":"toast-container"}},[_c('p',{staticClass:"message",domProps:{"innerHTML":_vm._s(_vm.message)}})])}},
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