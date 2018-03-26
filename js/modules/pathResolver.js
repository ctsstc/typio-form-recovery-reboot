window.terafm = window.terafm || {};

(function() {
	'use strict';

	// querySelector with ::shadow support
	terafm.resolvePath = function(selector) {

		var pathData = splitSelectorByEncapsulators(selector),
			currNode = window.top.document;

		for(var pathIndex = 0; pathIndex < pathData.paths.length; ++pathIndex) {
			var currSel = pathData.paths[pathIndex];

			currNode = currNode.querySelector(currSel);

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