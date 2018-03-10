window.terafm = window.terafm || {};

(function(DOMEvents, initHandler, ui, help, editableManager, options) {

	let node,
		trigger;

	initHandler.onInit(function() {
		if(options.get('quickAccessButtonEnabled')) {
			trigger = options.get('quickAccessButtonTrigger');
			addEventListeners();
		}
	});


	function addEventListeners() {
		makeThing();

		node.addEventListener('click', e => e.preventDefault() )
		node.addEventListener('mousedown', function(e) {
			e.preventDefault();
			e.stopPropagation();

			terafm.contextMenuController.setContext(terafm.focusedEditable, {x: parseFloat(node.style.left)+15, y: parseFloat(node.style.top)+15})
			terafm.contextMenuController.open();
		})

		// On editable focus
		if(trigger === 'focus') {
			DOMEvents.registerHandler('focus', function(e) {
				make(e.path[0])
			});
		} else if(trigger === 'doubleclick') {
			DOMEvents.registerHandler('dblclick', function(e) {
				if(editableManager.isEditable(e.path[0])) {
					make(e.path[0])
				}
			})
		}

		function make(editable) {
			var rect = editable.getBoundingClientRect();

			if(editableManager.isEditableText(editable)) {
				terafm.focusedEditable = editable

				var rect = terafm.editableManager.getRect(editable)

				node.style.top = rect.y + 3 + 'px';
				node.style.left = rect.x + rect.width - 22 + 'px';
				
				node.style.display = 'block';
			}
		}

		DOMEvents.registerHandler('blur', function() {
			node.style.display = 'none'
		});

	}

	function makeThing() {
		if(!node) {
			ui.inject({
				html: `<a id="popupTrigger" class="terafm-quickAccessTrigger" href="#"></a>`,
				returnNode: '#popupTrigger'
			}, function(res) {
				node = res;
			})
		}
	}

})(terafm.DOMEvents, terafm.initHandler, terafm.ui, terafm.helpers, terafm.editableManager, terafm.options);