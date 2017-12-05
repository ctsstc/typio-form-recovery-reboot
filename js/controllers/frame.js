window.terafmInjected = true;

(function() {
	'use strict';

	// Run everywhere (top window and child iframe injections)

	let basepath;

	try {
		
		if(window !== window.top) {
				window.top.postMessage({action: 'terafmRequestBasepath'}, '*');
		} else {
			basepath = chrome.extension.getURL('');
			init();
		}

		window.top.addEventListener('message', function(msg) {

			if(!basepath && msg.data.action && msg.data.action === 'terafmReturnBasepath') {
				basepath = msg.data.path;
				init();
			}
		});

	} catch(e) {}



	var observeConf = { childList: true, subtree: true, characterData: false, attributes: false };
	function init() {
		setTimeout(function() {
			var allNodes = document.getElementsByTagName('*');
			dig(allNodes);

			var observer = createObserver();
			observer.observe(document.body, observeConf);

		}, 10);
	}



	function createObserver() {
		return new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				mutation.addedNodes.forEach(function(node) {

					// If issues with not finding iframes or shadows
					// Do a querySelectorAll('*') on this instead
					dig([node]);
				});
			});    
		});
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
				observer.observe(shroot, observeConf);

				// Find all nodes inside root, dig through
				// Cannot use getElementsByTagName here even though it's faster
				dig(shroot.querySelectorAll('*'))
			}
		}
	}

	function inject(iframe, secondTry) {

		try {
			// Already injected into this frame, bail
			if(iframe.contentWindow.terafmInjected) {
				return;
			}

		} catch(e) {
			// No access, bail
			return;
		}


		// Try to inject immediately, but if 
		iframe.addEventListener('load', function() {
			inject(iframe);
		});


		var scriptFrame = window.top.document.createElement("script");
		scriptFrame.type = "text/javascript";
		scriptFrame.src = basepath + 'js/min/frame.min.js';

		try {
			iframe.contentWindow.document.body.appendChild(scriptFrame);

			if(secondTry) {
				console.log('success on second try!', iframe.contentWindow.document.body)
			} else {
				// console.log('Success on first try', iframe.contentWindow.document.body);
			}
		} catch(e) {
			// if(!secondTry) {
			// 	console.log('inject fail, retrying in 1 sec');
			// 	setTimeout(function() {
			// 		inject(iframe, true)
			// 	}, 1000);
			// } else {
			// 	console.log('ïnject failed second time');
			// }
		}
	}


})();