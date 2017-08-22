window.terafm = window.terafm || {};

(function() {

	var selector = 'input[type=text], input[type=email], input[type=search], input[type=url], textarea, [contenteditable]';

	var availableEditables = [];

	var onPickCallback;

	var init = false;

	window.terafm.editablePicker = {
		pick: function(callback) {
			onPickCallback = callback;
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
				destroyAll();
			}
		}, true);
	}

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
		var editableRect = editable.getBoundingClientRect(),
			pos = {};

		pos.top = editableRect.top + window.scrollY;
		pos.left = editableRect.left + window.scrollX;
		pos.width = editableRect.width;
		pos.height = editableRect.height;

		if(offset) {
			pos.top += offset.top;
			pos.left += offset.left;
		}

		var id = availableEditables.push(editable) - 1;

		var html = '<div data-id="'+ id +'" style="top: '+ pos.top +'px; left: '+ pos.left +'px; width: '+ pos.width +'px; height: '+ pos.height +'px;" class="terafm-clicky-thingy"></div>';
	
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