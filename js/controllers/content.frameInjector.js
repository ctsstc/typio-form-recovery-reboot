window.terafmInjected = true;

(function() {
	'use strict';

	// No support for cross domain frames
	try {
		window.top.document;
	} catch(e) {return;}

	// If top frame, fetch frame script and cache it
	if(window === window.top) {
		window.top.terafmBaseURL = chrome.extension.getURL('');

		fetch(window.top.terafmBaseURL + 'js/content.frameInjector.js').then(function(response) {
			response.text().then(function(scriptTxt) {

				window.top.terafmFrameScript = scriptTxt;

				init();

			});
		})

	// Child script, init immediately
	} else {
		init();
	}


	function init() {
		setTimeout(function() {

			// Dig through dom nodes
			let allNodes = document.getElementsByTagName('*');
			dig(allNodes);

			// Observe document.body and children
			try {
				let observer = createObserver();
				observer.observe(document.body, { childList: true, subtree: true, characterData: false, attributes: false });
			} catch(e) {}
			
		}, 500)
	}

	function dig(allNodes) {

		for(var i=0; i < allNodes.length; ++i) {

			// Skip f not element node
			if(allNodes[i].nodeType !== 1) continue;

			// Found iframe
			if(allNodes[i].nodeName.toLowerCase() === 'iframe') {
				inject(allNodes[i]);
			}

			// Found shadowroot
			if(allNodes[i].shadowRoot && allNodes[i].shadowRoot.mode === 'open') {
				var shroot = allNodes[i].shadowRoot;

				// If not already observed, attach observer
				if(!shroot.terafmObserving) {
					var observer = createObserver();
					observer.observe(shroot, { childList: true, subtree: true, characterData: false, attributes: false });
					shroot.terafmObserving = true;
				}

				// Find all nodes inside root, dig through
				// Cannot use getElementsByTagName here even though it's faster
				dig(shroot.querySelectorAll('*'))
			}
		}
	}

	function inject(iframe) {

		// Abort if already injected
		try {
			if(iframe.contentWindow.terafmInjected) {
				return;
			}

		// No access, probably cross domain
		} catch(e) { return; }

		// Inject immediately
		// console.log('injecting', iframe.contentWindow.document);
		iframe.contentWindow.eval( window.top.terafmFrameScript );

		// Also inject on window.load
		iframe.addEventListener('load', function() {
			inject(iframe);
		});

	}



	function createObserver() {
		let obsFunc = function(mutations) {
			mutations.forEach(function(mutation) {
				mutation.addedNodes.forEach(function(node) {

					dig([node]);

					if(node.getElementsByTagName) {
						dig(node.getElementsByTagName('*'));
					}
				});
			});
		}

		try {
			return new MutationObserver(obsFunc);
		} catch(e) {}
	}


})();