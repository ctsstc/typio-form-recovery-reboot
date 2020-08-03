
// var toproot = document.querySelector('#root'),
// 	shadows = toproot.querySelectorAll('.shadow');

// for(let s=0; s < shadows.length; ++s) {

// 	let node = shadows[s],
// 		nodeHTML = node.innerHTML + '';

// 	node.innerHTML = '';

// 	console.log(node);
// 	let nodeRoot = node.attachShadow({mode: 'open'});

// 	nodeRoot.innerHTML = nodeHTML;

// 	console.log(nodeHTML);
// 	if(nodeHTML.length) {
// 		// nodeRoot.innerHTML += nodeHTML;
// 	}

// }


createForNode(document.querySelector('#root'));

function createForNode(node, isFrSrh) {

	let children = node.children;

	// console.log(children);

	for(let s=0; s < children.length; ++s) {
		let node = children[s], nodeHTML, nodeRoot;


		// If child is not shadow, ignore
		if(!node.classList.contains('shadow')) continue;


		// Copy inner HTML and clear it
		nodeHTML = node.innerHTML + '';
		node.innerHTML = '';


		// Attach shadow
		nodeRoot = node.attachShadow({mode: 'open'});

		// Set shadow html to copied contents
		// nodeRoot.innerHTML = nodeHTML;


		// If 
		if(nodeHTML.length) {
			nodeRoot.innerHTML += nodeHTML;
		}

		var fr = nodeRoot.querySelector('iframe');
		// console.dir(fr);
		// return;
		if(fr) {
			fr.contentDocument.body.innerHTML = decodeHtml(decodeHtml(fr.innerHTML));
			let shaFr = fr.contentDocument.querySelector('.shadow');
			// console.log(shaFr, shaFr.parentNode);
			createForNode(shaFr.parentNode, true);

		}

		// var fr2 = 

		// createForNode(fr.contentWindow.document.body.queryS);
		createForNode(nodeRoot);

	}
}


function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}