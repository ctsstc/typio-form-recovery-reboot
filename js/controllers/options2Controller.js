(async function() {

	let vue = new Vue({
		...(await import('../templates/render.js')),
		el: '#app',
		data: {
			somevar: 'hello assgain?',
			many: [1,3,4,5,6]
		}
	});
	
})();