window.terafm = window.terafm || {};
terafm.blockController = {};

(function(controller) {

	controller.block = function() {
		let ok = confirm(`Disable Typio completely on ${window.location.hostname}? The page will be refreshed.`);
		if(ok) {
			terafm.blacklist.blockDomain(window.location.hostname);
			setTimeout(() => window.location.reload(), 50); // Give it some time to block
		}
		return ok;
	}

	controller.warn = function() {
		var enable = confirm(`Uh oh! The action cannot be performed because you have disabled Typio on this domain.\n\nDo you want to enable Typio again? The page will be refreshed.`);
		if(enable) {
			terafm.blacklist.unblock(location.href, function() {
				location.reload();
			})
		};
	}

})(terafm.blockController)
