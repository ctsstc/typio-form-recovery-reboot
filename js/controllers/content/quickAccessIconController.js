window.terafm = window.terafm || {};

(function(DOMEvents, initHandler, ui, help, editableManager, options) {
	"use strict";

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
			DOMEvents.registerHandler('editable-text-focus', function() {
				if(editableManager.checkRules(terafm.focusedEditable, 'elem')) {
					delayShow()
				}
			});
		}

		// On editable double click
		if(triggerAction === 'doubleclick') {
			DOMEvents.registerHandler('dblclick', function() {
				if(editableManager.checkRules(terafm.focusedEditable, 'elem')) {
					delayShow()
				}
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

	function isDisabled(editable) {
		return disabledEditables.indexOf(editable) !== -1;
	}

	function delayShow() {
		clearTimeout(iconDelayTimeout);
		iconDelayTimeout = setTimeout(show, 50);
	}

	function show(trigger) {
		if(!terafm.focusedEditable) return;

		build(function() {
			var editable = terafm.focusedEditable
			var edStyle = getComputedStyle(editable);

			// Prevent flying icon in some cases
			if(edStyle.display !== 'none') {
				hide();
			}

			if(!isDisabled(editable) && (parseInt(edStyle.width) > 20 && parseInt(edStyle.height) > 10)) {

				var rect = editableManager.getRect(editable),
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
				
				ui.touch();
			}
		})
	}

})(terafm.DOMEvents, terafm.initHandler, terafm.ui, terafm.helpers, terafm.editableManager, terafm.options);