window.terafm = window.terafm || {};

(function() {

	var selector = 'input[type=text], input[type=email], input[type=search], input[type=url], textarea, [contenteditable]';

	var availableEditables = [];

	var onPickCallback;

	var init = false;

	var pickerIsOpen = false;

	window.terafm.editablePicker = {
		pick: function(callback) {
			onPickCallback = callback;
			pickerIsOpen = true;
			openPicker();

			if(!init) {
				setupEventListeners();
				init = true;
			}
		}
	};

	function setupEventListeners() {
		document.addEventListener('click', function(e) {
			if(e.target.classList.contains('terafm-clicky-thingy')) {
				onPickCallback(availableEditables[e.target.dataset.id]);
				availableEditables = [];
				pickerIsOpen = false;
				destroyAll();
			}
		}, true);

		window.addEventListener('scroll', rePositionFunc);
	}

	var rePositionFunc = terafm.helpers.debounce(function() {
		if(pickerIsOpen) {
			// console.time('repos');
			destroyAll();
			openPicker();
			// console.timeEnd('repos');
		}
	}, 50);


	function openPicker() {
		var iframes = findIframes();

		iframes.forEach(function(frame) {
			var doc = frame.contentWindow.document,
				frameRect = frame.getBoundingClientRect(),
				editables = doc.querySelectorAll(selector);

			editables.forEach(function(editable) {
				createThingy(editable, {top: frameRect.top, left: frameRect.left})
			})
		});

		var editables = document.querySelectorAll(selector);
		editables.forEach(function(editable) {
			createThingy(editable);
		});

	}

	function createThingy(editable, offset) {
		var editablePos = terafm.ui.getOffset(editable),
			editableRect = editable.getBoundingClientRect(),
			thingyPos = {};

		thingyPos.top = editablePos.top;
		thingyPos.left = editablePos.left;
		thingyPos.width = editableRect.width;
		thingyPos.height = editableRect.height;

		if(offset) {
			thingyPos.top += offset.top;
			thingyPos.left += offset.left;
		}

		var id = availableEditables.push(editable) - 1;

		var html = '<div data-id="'+ id +'" style="top: '+ thingyPos.top +'px; left: '+ thingyPos.left +'px; width: '+ thingyPos.width +'px; height: '+ thingyPos.height +'px;" class="terafm-clicky-thingy"></div>';
	
		document.body.insertAdjacentHTML('beforeend', html);
	}

	function destroyAll() {
		var things = document.querySelectorAll('.terafm-clicky-thingy');

		deleteNodes(things);
	}

	function deleteNodes(nodes) {
		nodes.forEach(function(node) {
			deleteNode(node);
		});
	}

	function deleteNode(node) {
		node.parentElement.removeChild(node);
	}

	function findIframes() {
		var iframes = document.querySelectorAll('iframe'),
			matches = [];

		// Todo: Check so that it fails correctly
		iframes.forEach(function(frame) {
			try{
				if(frame.contentWindow.document) {
					matches.push(frame);
				}
			}catch(e) {}
		});

		return matches;
	}

})();