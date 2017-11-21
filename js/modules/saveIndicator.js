window.terafm = window.terafm || {};
terafm.saveIndicator = {};

(function(saveIndicator, ui, options, debounce) {

	let shroot, indicatorNode, animatorNode, indicatorStyle,
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
			shroot = ui.getShadowRoot();
			injectHTML(function() {
				indicatorNode = shroot.querySelector('#save-indicator');
				animatorNode = indicatorNode.querySelector('.animator');
				indicatorStyle = options.get('saveIndicator');
				indicatorNode.classList.add(indicatorStyle);
				if(callback) callback();
			});
		} else {
			if(callback) callback();
		}
	};

	function injectHTML(callback) {
		var template = chrome.runtime.getURL('templates/saveIndicator.tpl');

		var request = fetch(template).then(response => response.text());

		request.then(function(text) {
			shroot.querySelector('div').insertAdjacentHTML('beforeend', text);
			callback();
		});
	}

})(terafm.saveIndicator, terafm.ui, terafm.options, terafm.help.debounce);