

// Run once in top window

if(window === window.top) {
	// chrome.runtime.sendMessage('kacepnhocenciegcjpebnkmdbkihmnlb', 'from top');


	window.top.addEventListener('message', function(msg) {
		if(msg.data.action && msg.data.action === 'terafmSave') {
			terafm.db.init(function() {
				console.log('ready to save', msg.data.data, terafm);

				var data = msg.data.data;

				var edId = terafm.editableManager.generateEditableId(data.path)


				// Min length of string to save
				// Don't bother removing HTML here, it's too expensive
				if(data.value.length < 1) {
					terafm.db.deleteSingleRevisionByEditable(edId);
					return false;
				}

				// Special care for radio inputs, have to delete siblings
				// if(editable.type === 'radio') {
				// 	deleteRadioSiblingsFromStorage(editable, framePath);
				// }

				var data = {
					value: data.value,
					path: data.path
				}

				// console.log('saving', edId, data);
				terafm.toast.create('Saved entry');

				terafm.db.saveRevision(edId, data);
			});
		}
	})

}



// Run everywhere

(function() {

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
		// console.log('injected into', iframe.contentDocument);

		var scriptEdMan = window.top.document.createElement("script");
		scriptEdMan.type = "text/javascript";
		scriptEdMan.src = basepath + 'js/shared/editableManagerShared.js';

		var scriptHelp = window.top.document.createElement("script");
		scriptHelp.type = "text/javascript";
		scriptHelp.src = basepath + 'js/shared/helpers.js';

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
			iframe.contentWindow.document.body.appendChild(scriptHelp);
			iframe.contentWindow.document.body.appendChild(scriptEdMan);
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


// Run only in frames

(function() {

	// Only run in frames
	if(window.top !== window) {

		// console.log('injected!');

		// window.top.postMessage('test message from iframe! :)', '*');

		
		// console.log('injected into', window.document)


		// Set rightclick target in context controller
		document.addEventListener('contextmenu', function(e) {
			console.log('broadcasting message');
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
					edPath = terafm.editableManager.genPath(editable);
					//edId = terafm.editableManager.generateEditableId(edPath); // Can do later if need

				if(!edPath) {
					if(editable.dataset.terafmGlobId) {
						edPath = editable.dataset.terafmGlobId;
					} else {
						editable.dataset.terafmGlobId = 'global:' + Math.round(Math.random()*10000000);
						edPath = editable.dataset.terafmGlobId;
					}
					console.log('Could not generate input path, will save as:', edPath)
				}

				// console.log('generated', edPath);
				// console.log('found', $(edPath));

				window.top.postMessage({
					action: 'terafmSave',
					data: {
						value: edValue,
						path: edPath,
						//id: 1234, // New! Cannot depend on yet though
						//frame: ''// Deprecated
					}
				}, '*');
				// terafm.editableManager.saveEditable(editable, value);
			}

		}

	}

})();