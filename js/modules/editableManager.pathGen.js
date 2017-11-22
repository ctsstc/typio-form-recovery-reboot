window.terafm = window.terafm || {};
terafm.editableManager = terafm.editableManager || {};

(function(editableManager) {
	'use strict';

	// See here for possible improvements:
	// https://stackoverflow.com/questions/5728558/get-the-dom-path-of-the-clicked-a
	// Careful cause changing this will result in editableID's changing
	// which results in entries not being shown in context menu
	// Todo: Break through iframes
	//function GET_PATH_BACKUP(el) {
	editableManager.genPathOLD = function(el) {

		// Check easy way first, does elem have a valid id?
		if(el.id && el.id.match(/^[a-z0-9._-]+$/i) !== null) {
			return '#' + el.id;
		}

		var parentWithId = el.closest('[id]'),
			stack = [];

		// Loop through parent elements and build path
		while (el.parentNode != null) {

			// If parent has ID, use that and stop building
			if(el === parentWithId) {
				stack.unshift('#' + parentWithId.id);
				break;
			}

			// No need to go to html
			if(el.nodeName === 'HTML') {
				break;
			}

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
			var nodeName = el.nodeName.toLowerCase();
			if ( sibCount > 1 ) {
				stack.unshift(nodeName + ':nth-of-type(' + (sibIndex + 1) + ')');
			} else {
				stack.unshift(nodeName);
			}
			el = el.parentNode;
		}

		stack = stack.join(' > ');

		return stack;
	}
	editableManager.genPath = function(el) {

		// Cache path as dom node
		return terafm.cache(el, function() {

			var parentCapsule = getParentCapsule(el), // Will change as it breaks out
				isEncapsulated = parentCapsule ? true : false;

			var stack = [];

			while(el) {

				// If top body, stop
				if(el === window.top.document.body) {
					stack.unshift('body');
					break;
				}


				// If capsule
				if(el === parentCapsule) {

					// Shadow root. Add nothing to stack, break out
					if(el.toString() === '[object ShadowRoot]') {
						el = el.host;
					}

					// Iframe body. Add to stack, break out
					else if(el.ownerDocument.defaultView.frameElement) {
						el  = el.ownerDocument.defaultView.frameElement;
					}

					// Find next parent capsule
					parentCapsule = getParentCapsule(el);

					continue;
				}


				// If el has ID
				if(el.id && el.id.match(/^[a-z0-9._-]+$/i) !== null) {

					// If not encapsulated, add to stack and stop
					if(!isEncapsulated) {
						stack.unshift('#' + el.id);
						break;
					}

					// If encapsulated, add to stack and break out
					else {
						var nodeName = '#' + el.id;
						if(el.shadowRoot) {
							nodeName += '::shadow';
						}
						if(el.nodeName === 'IFRAME') {
							nodeName = 'iframe' + nodeName;
						}
						stack.unshift(nodeName);

						if(parentCapsule) {
							if(parentCapsule.toString() === '[object ShadowRoot]') {
								el = parentCapsule.host;
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
				if(el.shadowRoot) {
					nodeName += '::shadow';
				}

				stack.unshift(nodeName);
				el = el.parentNode;
			}


			stack = stack.join(' > ');

			return stack;
		});
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

		// Todo: ...
		// if(el.parentNode && el.parentNode.childNodes.length > 0) {
		// 	var sibCount = 0;
		// 	var sibIndex = 0;
		// 	for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
		// 		var sib = el.parentNode.childNodes[i];
		// 		if ( sib.nodeName == el.nodeName ) {
		// 			if ( sib === el ) {
		// 				sibIndex = sibCount;
		// 			}
		// 			sibCount++;
		// 		}
		// 	}
		// }

		// if(sibIndex) {
		// 	return sibCount;
		// }
	}

	function getParentCapsule(node) {
		return getParentShadowHost(node) || getParentIframe(node) || false;
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
		if(node.ownerDocument.defaultView.frameElement) {
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
})(terafm.editableManager);