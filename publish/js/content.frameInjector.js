window.terafm = window.terafm || {};

(function() {
	'use strict';

	// querySelector with ::shadow support
	terafm.resolvePath = function(selector) {

		var pathData = splitSelectorByEncapsulators(selector),
			currNode = window.top.document;

		for(var pathIndex = 0; pathIndex < pathData.paths.length; ++pathIndex) {
			var currSel = pathData.paths[pathIndex];

			try {
				currNode = currNode.querySelector(currSel);
			} catch(e) {
				throw new Error('Typio: querySelector failed on path:', currSel);
				return false;
			}

			// If node was not found, abort
			if(!currNode) {
				return false;
			} else {
				// console.log('success:', currNode, currSel);
			}


			if(pathData.instructions[pathIndex] === 'iframe') {
				currNode = currNode.contentDocument;
				if(!currNode) return false;
			}

			// If node is shadow host, go inside
			else if(pathData.instructions[pathIndex] === 'shadow') {
				currNode = currNode.shadowRoot;
				if(!currNode) return false;
			}
		}

		return currNode;
	}

	function splitSelectorByEncapsulators(selector) {
		var selParts = selector.split(/[\s>]+/g);

		let res = { paths: [], instructions: [] };

		// Loop through each "node" in path
		for(let partId=0; partId< selParts.length; ++partId) {
			let part = selParts[partId];

			if(part.indexOf('::shadow') !== -1) {
				addPath(part.replace('::shadow', ''), 'shadow');
			
			} else if(part.indexOf('iframe') === 0) {
				addPath(part, 'iframe')
			
			} else {
				addPath(part)
			}
		}

		return res;

		function addPath(path, instr) {

			// If no instruction (add to path)
			if(!instr) {

				// If last path index is iframe or shadow, create new index
				if(res.instructions[res.paths.length-1] !== undefined) {
					res.paths.push(path);

				// Add to path
				} else if(res.paths.length) {
					res.paths[res.paths.length-1] += ' > ' + path;

				// Begin path
				} else {
					res.paths[res.paths.length] = path;
				}

			// Iframe or shadow
			} else {
				res.paths.push(path);
				res.instructions[res.paths.length-1] = instr;
			}
		}

	}


})();

window.terafm = window.terafm || {};

(function() {
	'use strict';

	// Heavily modified from: https://stackoverflow.com/a/16742828/290790
	// Careful cause changing this will result in editableID's changing
	// which results in entries not being shown in context menu
	terafm.generatePath = function(el) {

		// Cannot break out of capsules, return fake path
		try{window.top.document} catch(e) {
			return generateFakePath();
		}

		var parentCapsule = getParentCapsule(el), // Will change as it breaks out
			isEncapsulated = parentCapsule ? true : false,
			isShadow = false;

		var stack = [],
			prevEl;

		while(el) {

			// console.log('curr el', el);

			// If top body, stop
			if(el === window.top.document.body) {
				stack.unshift('body');
				break;
			}


			// If capsule
			if(el === parentCapsule) {

				// console.log('reached capsule', el)

				// Shadow root. Add nothing to stack, break out
				if(el.toString() === '[object ShadowRoot]') {
					el = el.host;
					isShadow = true;
				}

				// Iframe body. Add to stack, break out
				else if(el.ownerDocument.defaultView.frameElement) {
					el  = el.ownerDocument.defaultView.frameElement;
				}

				// Find next parent capsule
				parentCapsule = getParentCapsule(el);
				// console.log('next parent capsule is', parentCapsule)

				continue;
			}


			// If el has ID
			if(el.id && el.id.length > 1 /*&& el.id.match(/^[a-z0-9._-]+$/i) !== null*/) {

				let escId = CSS.escape(el.id);

				// var idCount = el.ownerDocument.querySelectorAll('#' + el.id);
				var idCount = el.ownerDocument.querySelectorAll('#'+ escId );

				// If not encapsulated, add to stack and stop
				if(!isEncapsulated && idCount.length === 1) {
					stack.unshift('#' + escId);
					break;
				}

				// If encapsulated, add to stack and break out
				else if(idCount.length === 1) {
					var nodeName = '#' + escId;
					if(isShadow) {
						nodeName += '::shadow';
						isShadow = false;
					}
					if(el.nodeName === 'IFRAME') {
						nodeName = 'iframe' + nodeName;
					}
					stack.unshift(nodeName);

					if(parentCapsule) {
						if(parentCapsule.toString() === '[object ShadowRoot]') {
							el = parentCapsule.host;
							isShadow = true;
						} else {
							el = parentCapsule.ownerDocument.defaultView.frameElement;
						}
						parentCapsule = getParentCapsule(el);
					} else {
						el = el.parentNode;
					}
					continue;
				}
			}


			var nodeName = el.nodeName.toLowerCase();

			var sibIndex = getSiblingIndex(el);
			if(sibIndex !== false) {
				nodeName += ':nth-of-type(' + (sibIndex) + ')';
			}
			if(isShadow) {
				nodeName += '::shadow';
				isShadow = false;
			}

			stack.unshift(nodeName);
			el = el.parentNode;
		}


		stack = stack.join(' > ');

		return stack;
	}

	function generateFakePath() {
		return '#unidentified-' + Math.round(Math.random()*10000000);
	}

	function getSiblingIndex(el) {
		var sibCount = 0;
		var sibIndex = 0;

		// get sibling indexes
		for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
			var sib = el.parentNode.childNodes[i];
			if ( sib.nodeName == el.nodeName ) {
				if ( sib === el ) {
					sibIndex = sibCount;
				}
				sibCount++;
			}
		}

		return sibCount > 1 ? sibIndex+1 : false;
	}

	function getParentCapsule(node) {
		let caps = getParentShadowHost(node) || getParentIframe(node) || false;
		// console.log('parent capsule', caps);
		return caps;
	}

	function getParentShadowHost(node) {

		// Is in shadow DOM?
		for (; node; node = node.parentNode) {
			if (node.toString() === "[object ShadowRoot]") {
				return node;
			}
		}
	}

	function getParentIframe(node) {

		// Is in iframe?
		// console.dir(node);
		if(node.ownerDocument && node.ownerDocument.defaultView.frameElement) {
			return node.ownerDocument.documentElement;
		}
	}

	function getCapsuleHost(node) {
		if(node.ownerDocument.defaultView.frameElement) {
			return node.ownerDocument.defaultView.frameElement;
		} else if(node.host) {
			return node.host;
		}
	}
})();
window.terafm = window.terafm || {};

(function() {
	'use strict';

	let storageData = {},
		storageKeys = [];

	terafm.cache = function(key, cacheFunction) {
		let keyId = storageKeys.indexOf(key);
		if(keyId !== -1) {
			return storageData[keyId]
		}

		keyId = storageKeys.push(key) -1;
		storageData[keyId] = cacheFunction();

		return storageData[keyId];
	};

	terafm.wipeCache = function() {
		storageData = {};
		storageKeys = [];
	}

})();

(function() {
	'use strict';

	/*
	// No support for cross domain frames
	try {
		window.top.document;
	} catch(e) {
		return;
	}
	*/

	// Run only in child frames
	if(window === window.top) {
		return;
	}


	function eventHandler(e) {
		let msg = {
			action: 'terafmEventCatcher',
			event: {
				path: [terafm.cache(e.path[0], () => terafm.generatePath(e.path[0]))],
				type: e.type
			}
		}

		// Special case for to send mouse coordinates
		if(e.type === 'contextmenu') {
			msg.event.pageX = e.pageX;
			msg.event.pageY = e.pageY;
		} else if(e.type === 'keydown') {
			msg.event.key = e.key;
			// msg.event.ctrlKey = e.ctrlKey;
			// msg.event.altKey = e.altKey;
		} else if(e.type === 'keyup') {
			msg.event.keyCode = e.keyCode;
		}

		// console.log(msg);
		window.top.postMessage(msg, '*');
	}


	document.addEventListener('input', eventHandler);
	document.addEventListener('keyup', eventHandler, true);
	document.addEventListener('contextmenu', eventHandler);
	document.addEventListener('mousedown', eventHandler);
	document.addEventListener('click', eventHandler);
	document.addEventListener('dblclick', eventHandler);
	document.addEventListener('focus', eventHandler, true);
	document.addEventListener('blur', eventHandler, true);
	document.addEventListener('change', eventHandler, true);
	document.addEventListener('keydown', eventHandler, true);

})();