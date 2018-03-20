window.terafm = window.terafm || {};

(function(DOMEvents, initHandler, ui, help, editableManager, options) {

	let node,
		triggerAction,
		disabledEditables = [],
		iconDelayTimeout;

	initHandler.onInit(function() {
		if(options.get('quickAccessButtonEnabled')) {
			triggerAction = options.get('quickAccessButtonTrigger');
			addEventListeners();
		}
	});

	function addDeepEventListeners() {
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
	}


	function addEventListeners() {
		if(triggerAction === 'focus') {
			DOMEvents.registerHandler('focus', function() {
				delayShow('focus')
			});

			// Click is fallback to "focus".
			// In shadow DOM focus will only bubble the first time.
			// Tabbing still does not work correctly.
			DOMEvents.registerHandler('focus-fallback', function() {
				delayShow('focus-fallback')
			})
		}

		// On editable double click
		if(triggerAction === 'doubleclick') {
			DOMEvents.registerHandler('dblclick', function() {
				delayShow('doubleclick')
			})
		}

		DOMEvents.registerHandler('blur', function() {
			ui.touch();
			hide()
		});
	}

	function build(callback) {
		if(!node) {
			ui.inject({
				html: '<a id="quickAccessIcon" title="Open Typio Quick Access"><span data-hide="" title="Hide icon for this input this page load"></span></a>',
				returnNode: '#quickAccessIcon'
			}, function(res) {
				node = res;
				addDeepEventListeners();
				callback();
			})
		} else {
			callback();
		}
	}

	function hide() {
		if(node) node.style.display = 'none';
	}

	function disableForEditable() {
		if(terafm.focusedEditable) disabledEditables.push(terafm.focusedEditable);
	}

	function delayShow(trigger) {
		clearTimeout(iconDelayTimeout);
		iconDelayTimeout = setTimeout(function() {
			show(trigger)
		}, 50)
	}

	function show(trigger) {
		if(!terafm.focusedEditable) return;

		// Prevent flying icon in some cases
		if(trigger === 'focus-fallback' || trigger === 'doubleclick') hide();

		build(function() {
			var editable = terafm.focusedEditable
			var edStyle = getComputedStyle(editable);

			if(	disabledEditables.indexOf(editable) === -1 && 
				(parseInt(edStyle.width) > 20 && parseInt(edStyle.height) > 10)
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
			}
		})
	}

})(terafm.DOMEvents, terafm.initHandler, terafm.ui, terafm.helpers, terafm.editableManager, terafm.options);