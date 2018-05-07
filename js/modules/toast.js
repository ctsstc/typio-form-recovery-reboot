window.terafm = window.terafm || {};
terafm.toast = {};

(function(toast, ui) {

	let vue;

	toast.create = function(message) {
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

		import( chrome.runtime.getURL('../templates/toast.js') ).then((module) => {
			vue = new Vue({
				...(module),
				el: rootnode,
				methods: {
					showMessage: function(message) {
						this.message = message;
						this.isVisible = true;

						clearTimeout(this.timeout);
						this.timeout = setTimeout(() => {
							this.isVisible = false;
						}, 3000);
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
		})
	}

})(terafm.toast, terafm.ui)