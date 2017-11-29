window.terafm = window.terafm || {};
terafm.saveIndicator = {};

(function(saveIndicator, ui, options, debounce) {

	let indicatorNode, animatorNode, indicatorStyle,
		isVisible = false;

	saveIndicator.pulse = debounce(function() {
		// console.log('debounced animate');
		animate();
	}, 1000)

	saveIndicator.show = function() {
		if(isVisible) return;
		indicatorNode.classList.add('visible');
		isVisible = true;
	}
	saveIndicator.hide = function() {
		if(!isVisible) return;
		indicatorNode.classList.remove('visible');
		isVisible = false;
	}

	function animate() {
		animatorNode.style.animation = 'none';
		animatorNode.offsetHeight; // Trigger reflow
		animatorNode.style.animation = null;
	}


	saveIndicator.build = function(callback) {
		if(!indicatorNode) {

			ui.inject({
				path: 'templates/saveIndicator.tpl',
				returnNode: '#save-indicator'
			}, function(retnode) {
				indicatorNode = retnode;
				animatorNode = indicatorNode.querySelector('.animator');

				indicatorStyle = options.get('saveIndicator');
				indicatorNode.classList.add(indicatorStyle);

				if(callback) callback(retnode);
			})
			
		} else {
			if(callback) callback(indicatorNode);
		}
	};

})(terafm.saveIndicator, terafm.ui, terafm.options, terafm.help.debounce);