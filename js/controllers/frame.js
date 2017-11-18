(function() {
	'use strict';

	// Run everywhere (top window and child iframe injections)



	// Todo: Fix path
	var basepath = 'chrome-extension://kacepnhocenciegcjpebnkmdbkihmnlb/'; //chrome.extension.getURL('js/shared/frame.js');

	var observeConf = { childList: true, subtree: true, characterData: false, attributes: false };
	
	setTimeout(function() {
		var allNodes = document.body.querySelectorAll('*');
		dig(allNodes);
		// console.log('start dig');

		var observer = createObserver();
		observer.observe(document.body, observeConf);

	}, 100);



	function createObserver() {
		return new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				mutation.addedNodes.forEach(function(node) {
					// console.log(mutation);
					dig([node]);
				});
			});    
		});
	}

	function dig(allNodes) {

		for(var i=0; i < allNodes.length; ++i) {
			if(allNodes[i].nodeName === 'IFRAME') {
				// console.log('injecting', allNodes[i])
				inject(allNodes[i]);
			}

			if(allNodes[i].shadowRoot && allNodes[i].shadowRoot.mode === 'open') {
				var shroot = allNodes[i].shadowRoot;

				var observer = createObserver();
				observer.observe(shroot, observeConf);
				// console.log('observing', shroot);

				// Also dig into child elements
				for(var ch=0; ch < shroot.children.length; ++ch) {
					dig([shroot.children[ch]], 1);
				}
			}

		}
	}

	function inject(iframe, secondTry) {

		var scriptFrame = window.top.document.createElement("script");
		scriptFrame.type = "text/javascript";
		scriptFrame.src = basepath + 'js/min/frame.min.js';

		try {
			iframe.contentWindow.document.body.appendChild(scriptFrame);

			if(secondTry) {
				console.log('success on second try!')
			}
		} catch(e) {
			if(!secondTry) {
				console.log('inject fail, retrying in 1 sec');
				setTimeout(function() {
					inject(iframe, true)
				}, 1000);
			} else {
				console.log('ïnject failed second time');
			}
		}
	}


})();