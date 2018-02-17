window.terafm = window.terafm || {};

(function(DOMEvents, initHandler, ui, help, editableManager) {

	var node,
		currEditable;

	initHandler.onInit(function() {
		addEventListeners();
	});


	function addEventListeners() {
		makeThing();

		DOMEvents.registerHandler('focus', function(e) {
			var editable = e.path[0],
				rect = editable.getBoundingClientRect();

			if(editableManager.isEditableText(editable)) {
				currEditable = editable;

				node.style.top = rect.top + window.scrollY + 3 + 'px';
				node.style.left = rect.left + rect.width + window.scrollX - 24 + 'px';
				
				node.style.display = 'block';
			}
		});

		DOMEvents.registerHandler('blur', function() {
			node.style.display = 'none'
		});


		node.addEventListener('mousedown', function(e) {
			setTimeout(function() {
				terafm.contextMenuController.setContext(currEditable, {x: e.pageX, y: e.pageY})
				terafm.contextMenuController.open();
			}, 10)
		})

	}

	function makeThing() {
		if(!node) {
			ui.inject({
				html: `<a id="popupTrigger" href="#" style="background: yellow; border-radius: 2px; opacity: .5; width: 16px; height: 16px; position: absolute; top: 0; left: 0; z-index: 999999999;"></a>`,
				returnNode: '#popupTrigger'
			}, function(res) {
				node = res;
			})
		}
	}

	function getEditablePos(el) {
		var pos = el.getBoundingClientRect()
		return pos
	}

})(terafm.DOMEvents, terafm.initHandler, terafm.ui, terafm.helpers, terafm.editableManager);