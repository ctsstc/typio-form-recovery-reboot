window.terafm = window.terafm || {};
terafm.toast = {};

(function(toast, ui) {

	var rootNode;

	console.log('toast init')

	toast.create = function(text) {
		build(function() {
			rootNode.innerHTML = '<div class="toast">'+ text +'</div>';
			console.log('toast create')
		})
	}

	function build(callback) {
		console.log('building')
		ui.inject({
			path: 'templates/toast.tpl',
			returnNode: '#toast-container'
		}, function(resnode) {
			console.log('built ok')
			rootNode = resnode;
			callback();
		})
	}

})(terafm.toast, terafm.ui)