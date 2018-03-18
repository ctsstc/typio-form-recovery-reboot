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
				terafm.quickAccessController.setContext(terafm.focusedEditable, {x: parseFloat(node.style.left)+18, y: parseFloat(node.style.top)})
				terafm.quickAccessController.open();
			}
		})

		var tmt;

		// On editable focus
		if(triggerAction === 'focus') {
			DOMEvents.registerHandler('focus', function(e) {
				// In timeout becuase some sites like to animate positioning/size on focus
				tmt = setTimeout(function() {
					show(e.path[0], 'focus')
				}, 50)
			});

			// Click is fallback to "focus".
			// In shadow DOM focus will only bubble the first time.
			// Tabbing still does not work correctly.
			DOMEvents.registerHandler('click', function(e) {
				clearTimeout(tmt);
				tmt = setTimeout(function() {
					show(e.path[0], 'click');
				}, 50)
			})

		// On editable double click
		} else if(triggerAction === 'doubleclick') {
			DOMEvents.registerHandler('dblclick', function(e) {
				show(e.path[0], 'doubleclick')
			})
		}

		DOMEvents.registerHandler('blur', function(e) {
			ui.touch();
			clearTimeout(tmt);
			hide()
		});

	}

	function build() {
		if(!node) {
			ui.inject({
				html: '<a id="quickAccessIcon" title="Open Typio Quick Access"><span data-hide title="Hide icon for this input this page load"></span></a>',
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

	function show(editable, event) {

		editable = editableManager.getEditable(editable);

		if(	editable && editableManager.isEditableText(editable) &&
			disabledEditables.indexOf(editable) === -1 && 
			!(event === 'click' && editable === terafm.focusedEditable && getComputedStyle(editable).display !== 'none')
			) {

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