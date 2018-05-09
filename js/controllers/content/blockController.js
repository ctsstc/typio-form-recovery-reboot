window.terafm = window.terafm || {};
terafm.blockController = {};

(function(controller) {

	controller.block = function() {
		let ok = confirm(`Disable Typio completely on ${window.location.hostname}? The page will be refreshed.`);
		if(ok) {
			terafm.blacklist.block(window.location.hostname);
			setTimeout(() => window.location.reload(), 50); // Give it some time to block
		}
		return ok;
	}

})(terafm.blockController)