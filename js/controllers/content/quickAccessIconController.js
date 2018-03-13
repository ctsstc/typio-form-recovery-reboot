window.terafm = window.terafm || {};

(function(DOMEvents, initHandler, ui, help, editableManager, options) {

	let node,
		triggerAction,
		disabledEditables = [];

	initHandler.onInit(function() {
		if(options.get('quickAccessButtonEnabled')) {
			triggerAction = options.get('quickAccessButtonTrigger');
			addEventListeners();
		}
	});


	function addEventListeners() {
		build();

		node.addEventListener('click', e => e.preventDefault() )
		node.addEventListener('mousedown', function(e) {
			e.preventDefault();
			e.stopPropagation();

			if(e.target.dataset.hide !== undefined) {
				hide();
				disableForEditable();
			} else {
				terafm.quickAccessController.setContext(terafm.focusedEditable, {x: parseFloat(node.style.left)+15, y: parseFloat(node.style.top)+15})
				terafm.quickAccessController.open();
			}
		})

		var tmt;

		// On editable focus
		if(triggerAction === 'focus') {
			DOMEvents.registerHandler('focus', function(e) {
				// In timeout becuase some sites like to animate positioning/size on focus
				tmt = setTimeout(function() {
					show(e.path[0])
				}, 50)
			});

		// On editable double click
		} else if(triggerAction === 'doubleclick') {
			DOMEvents.registerHandler('dblclick', function(e) {
				show(e.path[0])
			})
		}

		DOMEvents.registerHandler('blur', function() {
			ui.touch();
			clearTimeout(tmt);
			node.style.display = 'none'
		});

	}

	function build() {
		if(!node) {
			ui.inject({
				html: '<a id="quickAccessIcon"><span data-hide></span></a>',
				returnNode: '#quickAccessIcon'
			}, function(res) {
				node = res;
			})
		}
	}

	function hide() {
		node.style.display = 'none';
	}

	function disableForEditable() {
		if(terafm.focusedEditable) disabledEditables.push(terafm.focusedEditable);
	}

	function show(editable) {

		if(editableManager.isEditableText(editable) && disabledEditables.indexOf(editable) === -1) {
			ui.touch();

			var rect = terafm.editableManager.getRect(editable),
				pos = {
					x: rect.x + rect.width - 18,
					y: rect.y
				},
				offset = 4;

			// Calculate edge offset
			if(rect.height < 50 && rect.width > 150) {
				offset = (rect.height/2) - (18/2);
			}

			// Vertical scrollbar check
			if(editable.scrollHeight > editable.clientHeight || ['search', 'number'].includes(editable.type)) {
				pos.x -= 17;
			}

			pos.x -= offset;
			pos.y += offset;

			node.style.top = pos.y + 'px';
			node.style.left = pos.x + 'px';
			node.style.display = 'block';

			terafm.focusedEditable = editable;
		}
	}

})(terafm.DOMEvents, terafm.initHandler, terafm.ui, terafm.helpers, terafm.editableManager, terafm.options);