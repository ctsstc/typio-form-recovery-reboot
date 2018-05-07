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
			vue.animate();
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
		import( chrome.runtime.getURL('../templates/saveIndicator.js') ).then((module) => {
			vue = new Vue({
				...(module),
				el: rootnode,
				methods: {
					show: function() {
						this.isVisible = true;
					},
					hide: function() {
						this.isVisible = false;
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
						styleClass: '',
						hexColor: '',

						isVisible: true,
						animator: null
					}
				},
				mounted: function() {
					this.styleClass = options.get('saveIndicator');
					this.hexColor = options.get('saveIndicatorColor');
					this.animator = this.$el.querySelector('.animator');
				}
			});

			if(callback) callback();
		})
	}

})(terafm.options, terafm.saveIndicator, terafm.editableManager, terafm.Events, terafm.initHandler);