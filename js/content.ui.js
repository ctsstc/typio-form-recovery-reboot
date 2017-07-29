window.terafm = window.terafm || {};



(function() {

	//resultListContainer = document.querySelector('#tera-result-list-container');
	//resultList = resultListContainer.querySelector('.tera-result-list');
	//resultListVisible = false;

	var contextTarget = null,
		contextRecoveryListVisible = false;


	window.terafm.ui = {

		injectHTML: function() {
			document.body.insertAdjacentHTML('afterbegin', "<div id='tera-result-list-container' class='hidden'><ul class='tera-result-list'></ul></div>");
		},

		setupEventHandlers: function() {

			var resultListContainer = getResultListContainer();

			window.addEventListener('resize', windowResizeHandler);
			document.addEventListener('contextmenu', documentContextHandler);
			document.addEventListener('click', documentClickHandler);
			document.addEventListener('keyup', documentKeyupHandler);
			document.addEventListener('change', documentChangeHandler);
			document.addEventListener('focus', documentFocusHandler, true);

			resultListContainer.addEventListener('click', resultListClickHandler)
			resultListContainer.addEventListener('mouseover', resultListMouseOverHandler)
			resultListContainer.addEventListener('mouseleave', resultListMouseLeaveHandler)

		},

		recoverContextTarget: function() {

			// We know which input that needs recovery
			var inputPath = terafm.ui.generateDomPath(contextTarget),
				inputId = terafm.helpers.generateInputId(inputPath),
				revisions = terafm.db.getRevisionsByInput(inputPath);

			populateResultList(revisions, inputId);

			positionResultList(contextTarget);

			showResultList();

			// Ask database for input revision history

			// Populate, position and display result list
		},

		generateDomPath: function(el) {

			// Check easy way first, does it have a valid id?
			if(el.id && el.id.match(/^[a-z0-9._-]+$/i) !== null) {
				return '#' + el.id;
			}

			var stack = [];
			while (el.parentNode != null) {
				var sibCount = 0;
				var sibIndex = 0;
				// get sibling indexes
				for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
					var sib = el.parentNode.childNodes[i];
					if ( sib.nodeName == el.nodeName ) {
						if ( sib === el ) {
							sibIndex = sibCount;
						}
						sibCount++;
					}
				}
				var nodeName = el.nodeName.toLowerCase();
				if ( sibCount > 1 ) {
					stack.unshift(nodeName + ':nth-of-type(' + (sibIndex + 1) + ')');
				} else {
					stack.unshift(nodeName);
				}
				el = el.parentNode;
			}
			stack.splice(0,1); // removes the html element
			return stack.join(' > ');
		},
		parent: function(elem, cb) {
			var parent = elem.parentElement;
			if (!parent) return undefined;
			return fn(parent) ? parent : tera.parent(parent, cb);
		}
	}

	function populateResultList(revisions, inputId) {

		var sessionId = terafm.db.sessionId();
		var html = '';

		// Don't show current session
		if (sessionId in revisions) {
			delete revisions[sessionId];
		}


		if(Object.keys(revisions).length < 1) {
			html = '<li>Nothing to recover</li>';

		} else {

			var sortedKeys = Object.keys(revisions);
			sortedKeys = sortedKeys.sort().reverse();

			for(key in sortedKeys) {
				var revision = revisions[sortedKeys[key]],
					safeString = terafm.helpers.encodeHTML(revision.value).substring(0,50);

				html += '<li data-session="'+ sortedKeys[key] +'">';
					html += '<span data-delete="'+ sortedKeys[key] +'" class="tera-icon-right tera-icon-delete" title="Delete entry"></span>';
					html += '<span data-set-single-entry="'+ sortedKeys[key] +'" class="tera-icon-right tera-icon-single" title="Recover this input"></span>';
					html += safeString;
				html += '</li>';
			}
			html += '<li data-delete-all="'+ inputId +'">Delete all entries</li>';
		}


		var resultListContainer = document.querySelector('#tera-result-list-container'),
			resultList = resultListContainer.querySelector('.tera-result-list');

		resultList.innerHTML = html;
	}

	/*tera.buildUI = function() {

		// If opened before window has finished loading
		if(!tera.UICurrentInput) {
			return false;
		}

		var input = tera.UICurrentInput,
			inPath = tera.generateDomPath(input),
			inHashPath = tera.helpers.hashCode(inPath),
			entries = tera.getEntriesByPath(inPath);

		// Don't show current entry
		if(entries) {
			delete entries[tera.session];
		}

		// Build entry list
		if(entries) {
			var timestamps = [],
				timestamp,
				html = '';

			// Grab all timestamps and sort them newest > oldest
			for(timestamp in entries) {
				timestamps.push(parseInt(timestamp));
			}
			timestamps.sort().reverse();

			// Loop through timestamps in order and build entries
			for(timestamp in timestamps) {
				var timestamp = timestamps[timestamp];
					entry = entries[timestamp],
					prepStr = tera.helpers.encodeHTML(entry.value).substring(0,50);

				html += '<li data-timestamp="'+ timestamp +'">';
					html += '<span data-delete="'+ timestamp +'" class="tera-icon-right tera-icon-delete" title="Delete entry"></span>';
					html += '<span data-set-single-entry="'+ timestamp +'" class="tera-icon-right tera-icon-single" title="Recover this input"></span>';
					html += prepStr;
				html += '</li>';
			}
			html += '<li data-delete-all="'+ inHashPath +'">Delete all entries</li>';

			tera.UIResults.innerHTML = html;

		// No entries, show fallback
		} else {
			tera.UIResults.innerHTML = '<li>Nothing to recover</li>';
		}

		//tera.positionUI();
	}*/


	function positionResultList(target) {
		var resultListContainer = document.querySelector('#tera-result-list-container'),
			targetRect = target.getBoundingClientRect(),
			bodyRect = document.body.getBoundingClientRect(),
			UIWidth = 250, leftPos = 0,
			inputBodyOffset = targetRect.left - bodyRect.left;

		// First try to align on right side of input
		if((targetRect.left + targetRect.width + UIWidth) <= document.documentElement.clientWidth) {
			leftPos = inputBodyOffset + targetRect.width;

		// Otherwise align on left side of input
		} else if((targetRect.left - UIWidth) > 0) {
			leftPos = inputBodyOffset - UIWidth;

		// Otherwise align right side of window
		} else {
			leftPos = document.documentElement.clientWidth - UIWidth;
		}

		resultListContainer.style = 'top: '+ (targetRect.top + window.scrollY) +'px; left: '+ leftPos +'px;';
	}

	function setInputPlaceholdersBySession(session, specificInput) {


		var revisions = terafm.db.getRevisionsBySession(session);

		if(revisions) {
			for(session in revisions) {
				var rev = revisions[session],
					input = document.querySelector(rev.path);

				// If a specific input was supplied, only continue if we're looping through that input
				if(specificInput && specificInput !== input) {
					continue;
				}

				input.classList.add('teraUIActiveInput');

				// Save original value, to be restored later
				if(!input.dataset.hasOwnProperty('orgValue')) {
					if(input.nodeName == 'INPUT' || input.nodeName == 'TEXTAREA') {

						if(input.type === 'checkbox') {
							input.dataset.orgValue = input.checked ? 1 : 0;

						} else if(input.type === 'radio') {
							var radioSiblings = document.querySelectorAll('input[type=radio][name="'+ input.name +'"]');
							radioSiblings.forEach(function(sib) {
								if(sib.checked) {
									var orgPath = terafm.ui.generateDomPath(sib);
									input.dataset.orgValue = orgPath;
								}
							});

						} else {
							input.dataset.orgValue = input.value;
						}

					// Contenteditable
					} else {
						input.dataset.orgValue = input.innerHTML;
					}
				}

				setInputValue(input, rev.value);
			}
		}

	}

	function resetPlaceholders(keepValue) {
		var phs = document.querySelectorAll('.teraUIActiveInput');

		for(i in phs) {
			var input = phs[i];

			// querySelectorAll returns an object of DOM nodes and a "length" value, we only wanna loop through the DOMs
			if(!input.nodeName) continue;

			input.classList.remove('teraUIActiveInput');

			if(!keepValue) {
				setInputValue(input, input.dataset.orgValue);
			}

			delete input.dataset.orgValue;
		}
	}



	function getInputValue(input) {
		if(input.nodeName == 'INPUT' || input.nodeName == 'TEXTAREA') {

			// Special care for checkable inputs
			if(input.type === 'checkbox' || input.type === 'radio') {
				return input.checked ? 1 : 0;

			} else {
				return input.value;
			}

		}
		return input.innerHTML;
	}

	function setInputValue(input, val) {

		if(input.nodeName == 'INPUT' || input.nodeName == 'TEXTAREA') {

			// Special care for checkable inputs
			if(input.type === 'checkbox') {
				val = parseInt(val);
				input.checked = val ? true : false;

			} else if(input.type === 'radio') {

				// Set by value
				if(val == parseInt(val)) {
					input.checked = true;

				// Set by path
				} else {
					var orgRadio = document.querySelector(val);
					if(orgRadio) {
						orgRadio.checked = true;
					}
				}

			} else {
				input.value = val;
			}

		} else {
			input.innerHTML = val;
		}
	}


	function showResultList() {
		var resultListContainer = getResultListContainer();
		resultListContainer.classList.remove('hidden');
		contextRecoveryListVisible = true;
	}

	function hideResultList() {
		var resultListContainer = getResultListContainer();
		resultListContainer.classList.add('hidden');
		contextRecoveryListVisible = false;
	}

	function getResultListContainer() {
		return document.querySelector('#tera-result-list-container');
	}


	function resultListClickHandler(e) {
		var item = e.target,
			inputPath = terafm.ui.generateDomPath(contextTarget);

		// If delete was clicked
		if('delete' in item.dataset) {

			var ul = item.parentElement.parentElement;

			// Delete from storage and delete dom entry
			terafm.db.deleteSingleRevisionByInput(inputPath, item.dataset.delete)
			item.parentElement.remove();

			// Restore input text from before hovering
			resetPlaceholders();

			// If no more entries, hide
			var lis = ul.querySelector('li[data-session]');
			if(!ul.querySelector('li[data-session]')) {
				hideResultList();
			}

			e.stopPropagation();
			return true;

		// If delete all was clicked
		} else if('deleteAll' in item.dataset) {
			var hashPath = item.dataset.deleteAll;
			terafm.db.deleteAllRevisionsByInput(inputPath);
		}

		hideResultList();
		resetPlaceholders(true); // Remove placeholder styling from all inputs, keeps the text

		e.stopPropagation();
	}

	function resultListMouseOverHandler(e) {

		var listItem = e.target,
			single = listItem.dataset.setSingleEntry ? contextTarget : false,
			session = listItem.dataset.session || listItem.dataset.setSingleEntry;

		resetPlaceholders();

		// if(session === undefined) {
		// 	return false;
		// }

		setInputPlaceholdersBySession(session, single);
	}

	function resultListMouseLeaveHandler() {
		resetPlaceholders();
	}

	function documentContextHandler(e) {
		/*
		if(tera.UIIsShowing) tera.hideUI();
		var newInput = tera.getEditable(e.target);

		if(newInput) {
			terafm.ui.targetRecoveryField = newInput;
		} else {
			terafm.ui.targetRecoveryField = false;
		}
		*/

		contextTarget = e.target;
	}

	function documentClickHandler() {
		if(contextRecoveryListVisible) {
			hideResultList();
		}
	}

	function windowResizeHandler() {
		if(contextRecoveryListVisible) {
			positionResultList(contextTarget);
		}
	}

	function documentKeyupHandler(e) {
		terafm.engine.saveRevision(e.target, getInputValue(e.target));
	}

	function documentChangeHandler(e) {
		terafm.engine.saveRevision(e.target, getInputValue(e.target));
	}

	function documentFocusHandler() {
		if(contextRecoveryListVisible) {
			hideResultList();
		}
	}

})();