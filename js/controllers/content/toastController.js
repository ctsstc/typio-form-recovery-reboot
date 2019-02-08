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
			'@import-vue content/toast':0,
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