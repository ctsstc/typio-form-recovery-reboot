


/*	// create an observer instance
	var observer = new MutationObserver(function(mutations) {
		// console.log(mutations);
	  mutations.forEach(function(mutation) {
	    console.log(mutation);
	  });    
	});
	 
	// configuration of the observer:
	var config = { attributes: false, childList: true, characterData: false };
	 
	// pass in the target node, as well as the observer options
	observer.observe(document.body, config)
*/


// Creates input with random ID

var randId = 'randomId-' + Math.round(Math.random()*100000),
    html = '<input type="text" id="'+ randId +'" placeholder="'+ randId +'" />';
    
document.body.insertAdjacentHTML('beforeend', html)




// Generates shadow dom

var shadowElm = document.querySelector('#shadow'),
	shroot = shadowElm.attachShadow({mode: 'open'});

shroot.innerHTML = '<input placeholder="Input in shadow DOM" /><div></div>';

var shroot2 = shroot.querySelector('div').attachShadow({mode: 'open'});
shroot2.innerHTML = '<input placeholder="2nd lvl input in shadow DOM" /><iframe></iframe>';

var iframe = shroot2.querySelector('iframe');
iframe.contentWindow.document.body.innerHTML = '<input placeholder="input in nested shadow roots" /><div></div>';

var shroot3 = iframe.contentWindow.document.querySelector('div').attachShadow({mode: 'open'});

shroot3.innerHTML = '<input placeholder="Input nested shadow doms and iframe" /><div></div>';



var ifr = document.querySelector('#ifr');
ifr.contentDocument.body.innerHTML = 'Hello says iframe! <iframe id="ifr2"></iframe>';
var ifr2 = ifr.contentDocument.body.querySelector('#ifr2');
ifr2.contentDocument.body.innerHTML = 'Hello from nested!';