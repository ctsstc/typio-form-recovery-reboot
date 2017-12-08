window.terafmInjected = true;

(function() {
	'use strict';

	// No support for cross domain frames
	try {
		window.top.document;
	} catch(e) {return;}


	let basepath;

	// If top frame
	if(window === window.top) {
		basepath = chrome.extension.getURL('');
		init();

	// Iframe
	} else {
		window.top.postMessage({action: 'terafmRequestBasepath'}, '*');
	}

	window.top.addEventListener('message', function(msg) {
		if(!basepath && msg.data.action && msg.data.action === 'terafmReturnBasepath') {
			basepath = msg.data.path;
			init();
		}
	});


	function init() {
		let allNodes = document.getElementsByTagName('*');
		dig(allNodes);

		let observer = createObserver();
		if(observer) {
			observer.observe(document.body, { childList: true, subtree: true, characterData: false, attributes: false });
		}
	}



	function createObserver() {
		let obsFunc = function(mutations) {
			mutations.forEach(function(mutation) {
				mutation.addedNodes.forEach(function(node) {

					// If issues with not finding iframes or shadows
					// Do a querySelectorAll('*') on this instead
					dig([node]);
				});
			});
		}

		try {
			return new MutationObserver(obsFunc);
		} catch(e) {
			console.error('error:', e);
		}
	}

	function dig(allNodes) {

		for(var i=0; i < allNodes.length; ++i) {

			// Skip f not element node
			if(allNodes[i].nodeType !== 1) continue;

			// Found iframe
			if(allNodes[i].nodeName === 'IFRAME') {
				inject(allNodes[i]);
			}

			// Found shadowroot
			if(allNodes[i].shadowRoot && allNodes[i].shadowRoot.mode === 'open') {
				var shroot = allNodes[i].shadowRoot;

				var observer = createObserver();
				observer.observe(shroot, { childList: true, subtree: true, characterData: false, attributes: false });

				// Find all nodes inside root, dig through
				// Cannot use getElementsByTagName here even though it's faster
				dig(shroot.querySelectorAll('*'))
			}
		}
	}

	function inject(iframe) {

		try {

			// Already injected into this frame, bail
			if(iframe.contentWindow.terafmInjected) {
				return;
			}

		// No access
		} catch(e) {return;}


		// Try to inject immediately, but if 
		iframe.addEventListener('load', function() {
			inject(iframe);
		});


		var scriptFrame = window.top.document.createElement("script");
		scriptFrame.type = "text/javascript";
		scriptFrame.src = basepath + 'js/min/frame.min.js';

		// try {
			iframe.contentWindow.document.body.appendChild(scriptFrame);
		// } catch(e) {}
	}


})();