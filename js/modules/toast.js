window.terafm = window.terafm || {};
terafm.toast = {};

(function(toast, ui) {

	var rootNode;

	toast.create = function(text) {
		build(function() {
			rootNode.innerHTML = '<div class="toast">'+ text +'</div>';
		})
	}

	function build(callback) {
		ui.inject({
			path: 'templates/toast.tpl',
			returnNode: '#toast-container'
		}, function(resnode) {
			rootNode = resnode;
			callback();
		})
	}

})(terafm.toast, terafm.ui)