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

var randId = "randomId-" + Math.round(Math.random() * 100000),
  html =
    '<fieldset><legend>JS - Random ID, Inserted</legend><input type="text" id="' +
    randId +
    '" placeholder="' +
    randId +
    '" /></fieldset>';

document.body.insertAdjacentHTML("beforeend", html);

setTimeout(function () {
  document.body.insertAdjacentHTML(
    "afterbegin",
    '<fieldset><legend>Dynamic Insertion vis JS</legend><div class="dyno"></div></fieldset>',
  );
  var shadowElm = document.querySelector(".dyno"),
    shroot = shadowElm.attachShadow({ mode: "open" });

  shroot.innerHTML =
    "<style>iframe { border: 2px solid red; background: rgba(255, 0, 0, .1); }</style>" +
    "<fieldset><legend>Shadow DOM Inputs</legend>" +
    '<input placeholder="Input dynamic shadow DOM"/>' +
    '<div style = "display: inline-block; border: 1px solid blue; padding: 4px;" contenteditable>contenteditable</div>' +
    '<input placeholder = "Input2 dynamic shadow DOM"/>' +
    '<fieldset><legend>Shadow DOM iFrame</legend><iframe height="360" width="400"></iframe></fieldset>';

  shroot.querySelector("iframe").contentWindow.document.body.innerHTML =
    '<fieldset><legend>Initial iFrame Content</legend><input placeholder="placeholder dynamic" /></fieldset>';

  setTimeout(function () {
    shroot
      .querySelector("iframe")
      .contentWindow.document.body.insertAdjacentHTML(
        "afterbegin",
        '<fieldset><legend>Delayed Add</legend><input placeholder="delayed add" /></fieldset>',
      );

    setTimeout(function () {
      shroot
        .querySelector("iframe")
        .contentWindow.document.body.insertAdjacentHTML(
          "afterbegin",
          "<style>iframe { border: 2px solid blue; background: rgba(0, 0, 255, .1); }</style>" +
            '<fieldset><legend>Shadow DOM iFrame in an iFrame</legend><iframe height="40"></iframe></fieldset>' +
            '<fieldset><legend>Text Area</legend><textarea placeholder="dsf" rows=5 cols=20></textarea></fieldset>',
        );
      var iframe = shroot
        .querySelector("iframe")
        .contentWindow.document.querySelector("iframe").contentWindow;
      iframe.document.body.innerHTML = '<input type="new in iframe" />';
    }, 300);
  }, 300);
}, 300);

// Generates shadow dom

var shadowElm = document.querySelector("#shadow"),
  shroot = shadowElm.attachShadow({ mode: "open" });

shroot.innerHTML = '<input placeholder="Input in shadow DOM" /><div></div>';

var shroot2 = shroot.querySelector("div").attachShadow({ mode: "open" });
shroot2.innerHTML =
  "<style>iframe { border: 2px solid red; background: rgba(255, 0, 0, .1); }</style>" +
  '<input placeholder="2nd lvl input in shadow DOM" /><fieldset><legend>iFrame</legend><iframe id="frameId"></iframe></fieldset>';

var iframe = shroot2.querySelector("iframe");
iframe.contentWindow.document.body.innerHTML =
  '<input placeholder="input in nested shadow roots" /><div></div><div class="sec"><p>Hello world!</p></div>';

var shroot3 = iframe.contentWindow.document
  .querySelector(".sec")
  .attachShadow({ mode: "open" });

shroot3.innerHTML =
  '<input placeholder="Input nested shadow doms and iframe" /><div></div>';

var ifr = document.querySelector("#ifr");
ifr.contentDocument.body.innerHTML =
  'Hello says iframe! <input type="text" style="width: 80px"/><iframe id="ifr2"></iframe><div style="display: inline-block; border: 1px solid blue; padding: 4px;" contenteditable>contenteditable</div>' +
  "<style>iframe { border: 2px solid blue; background: rgba(0, 0, 255, .1); }</style>";
var ifr2 = ifr.contentDocument.body.querySelector("#ifr2");
ifr2.contentDocument.body.innerHTML =
  'Hello from nested! <input style="position: absolute; left: 120px;" type="text"/>';
