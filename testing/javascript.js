


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


setTimeout(function() {

	document.body.insertAdjacentHTML('afterbegin', '<div class="dyno"></div>')
	var shadowElm = document.querySelector('.dyno'),
		shroot = shadowElm.attachShadow({mode: 'open'});

	shroot.innerHTML = '<input placeholder="Input dynamic shadow DOM" /><div style="display: inline-block; border: 1px solid blue; padding: 4px;" contenteditable>contenteditable</div><input placeholder="Input2 dynamic shadow DOM" /><iframe height="180"></iframe>';

	shroot.querySelector('iframe').contentWindow.document.body.innerHTML = '<input placeholder="placeholder dynamic" />';

	setTimeout(function() {
		shroot.querySelector('iframe').contentWindow.document.body.insertAdjacentHTML('afterbegin', '<input placeholder="new" />');

		setTimeout(function() {
			shroot.querySelector('iframe').contentWindow.document.body.insertAdjacentHTML('afterbegin', '<iframe height="40"></iframe><textarea placeholder="dsf" rows=5 cols=20></textarea>');
			var iframe = shroot.querySelector('iframe').contentWindow.document.querySelector('iframe').contentWindow;
			iframe.document.body.innerHTML = '<input type="new in iframe" />';
		}, 300);
	}, 300);
}, 300);


// Generates shadow dom

var shadowElm = document.querySelector('#shadow'),
	shroot = shadowElm.attachShadow({mode: 'open'});

shroot.innerHTML = '<input placeholder="Input in shadow DOM" /><div></div>';

var shroot2 = shroot.querySelector('div').attachShadow({mode: 'open'});
shroot2.innerHTML = '<input placeholder="2nd lvl input in shadow DOM" /><iframe id="frameId"></iframe>';

var iframe = shroot2.querySelector('iframe');
iframe.contentWindow.document.body.innerHTML = '<input placeholder="input in nested shadow roots" /><div></div><div class="sec"><p>Hello world!</p></div>';

var shroot3 = iframe.contentWindow.document.querySelector('.sec').attachShadow({mode: 'open'});

shroot3.innerHTML = '<input placeholder="Input nested shadow doms and iframe" /><div></div>';



var ifr = document.querySelector('#ifr');
ifr.contentDocument.body.innerHTML = 'Hello says iframe! <input type="text" style="width: 80px"/><iframe id="ifr2"></iframe><div style="display: inline-block; border: 1px solid blue; padding: 4px;" contenteditable>contenteditable</div>';
var ifr2 = ifr.contentDocument.body.querySelector('#ifr2');
ifr2.contentDocument.body.innerHTML = 'Hello from nested! <input style="position: absolute; left: 120px;" type="text"/>';