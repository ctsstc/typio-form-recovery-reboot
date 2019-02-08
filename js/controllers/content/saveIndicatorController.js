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
			'@import-vue content/saveIndicator':0,
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