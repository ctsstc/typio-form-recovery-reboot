
// console.log('running');

(function() {

	// Todo: Fix path
	var basepath = 'chrome-extension://kacepnhocenciegcjpebnkmdbkihmnlb/'; //chrome.extension.getURL('js/shared/frame.js');

	setTimeout(function() {
		var allNodes = document.body.querySelectorAll('*');
		dig(allNodes);
		console.log('start dig');
	}, 2000);

	function dig(allNodes) {

		for(var i=0; i < allNodes.length; ++i) {
			if(allNodes[i].nodeName === 'IFRAME') {
				inject(allNodes[i]);
			}

			if(allNodes[i].shadowRoot && allNodes[i].shadowRoot.mode === 'open') {
				var shroot = allNodes[i].shadowRoot;

				// Also dig into child elements
				for(var ch=0; ch < shroot.children.length; ++ch) {
					dig([shroot.children[ch]], 1);
				}
			}

		}
	}

	function inject(iframe, secondTry) {
		// console.log('injected into', iframe.contentDocument);

		var scriptEdMan = window.top.document.createElement("script");
		scriptEdMan.type = "text/javascript";
		scriptEdMan.src = basepath + 'js/shared/editableManagerShared.js';

		var scriptFrame = window.top.document.createElement("script");
		scriptFrame.type = "text/javascript";
		scriptFrame.src = basepath + 'js/shared/frame.js';

		var scriptOpt = window.top.document.createElement("script");
		scriptOpt.innerHTML = "window.terafm = window.terafm || {}; window.terafm.globalOptions = JSON.parse('" + JSON.stringify(terafm.globalOptions) + "');";


		// if(!iframe.contentWindow.document.body) {
		// 	console.log('test', iframe.contentWindow.document.appendChild)
		// }
		// console.log(iframe.contentWindow.document);

		try {
			iframe.contentWindow.document.body.appendChild(scriptOpt);
			iframe.contentWindow.document.body.appendChild(scriptEdMan);
			iframe.contentWindow.document.body.appendChild(scriptFrame);

			if(secondTry) {
				console.log('success on second try!')
			}
		} catch(e) {
			console.log('fail', iframe)
			if(!secondTry) {
				console.log('retrying in 1 sec');
				setTimeout(function() {
					inject(iframe, true)
				}, 1000);
			}
		}
	}

})();


if(window === window.top) {
	// chrome.runtime.sendMessage('kacepnhocenciegcjpebnkmdbkihmnlb', 'from top');

	window.top.addEventListener('message', function(msg) {
		console.log('ready to save', msg.data.data, terafm);
		// terafm.editableManager.saveEditable(editable, value);
	})

}

(function() {

	// Only run in frames
	if(window.top !== window) {

		console.log('injected!');

		// window.top.postMessage('test message from iframe! :)', '*');

		
		// console.log('injected into', window.document)


		// Set rightclick target in context controller
		document.addEventListener('contextmenu', function(e) {
			console.log('broadcasting message');
			chrome.runtime.sendMessage('kacepnhocenciegcjpebnkmdbkihmnlb', 'contextDetected');
			// var editable = terafm.editableManager.getEditable(e.target);
			var editable = terafm.editableManager.getEditable(e.path[0]);

			if(editable !== false) {
				console.log(editable);
				// Todo: Send message
				// terafm.context.iframeSetContextTarget(editable, window.frameElement);
				// console.log('setting target', editable);
			}
		});





		// Click anywhere in iframe to close dialog
		// document.addEventListener('click', function() {
		// 	terafm.context.close();
		// });



		// For saving
		document.addEventListener('change', documentChangeHandler);
		document.addEventListener('keyup', documentChangeHandler);

		function documentChangeHandler(e) {

			// var editable = terafm.editableManager.getEditable(e.target);
			var editable = terafm.editableManager.getEditable(e.path[0]);

			if(editable) {
				var edValue = terafm.editableManager.getEditableValue(editable),
					edPath = terafm.editableManager.genPath(editable),
					edId = terafm.editableManager.generateEditableId(edPath); // Can do later if need

				window.top.postMessage({
					action: 'save',
					data: {
						value: edValue,
						path: edId,
						id: 1234, // New! Cannot depend on yet though
						frame: ''// Deprecated
					}
				}, '*');
				// terafm.editableManager.saveEditable(editable, value);
			}

		}

	}

})();