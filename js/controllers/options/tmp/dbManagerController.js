(function() {

	let vue = new Vue({
		...{render: function render() {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('div',[_vm._v(" Hello! "),_c('br'),_vm._v(" "+_vm._s(_vm.totStats)+" ")]),_vm._v(" "),_c('div',{staticClass:"content"},[_c('div',{staticClass:"col"},[_c('p',[_vm._v("list of domains")]),_vm._v(" "),(_vm.domainStats)?_c('ul',{staticClass:"domain-list"},_vm._l((_vm.domainStats),function(dom){return _c('li',[_c('span',{staticClass:"grow"},[_vm._v(_vm._s(dom.domain))]),_vm._v(" "),_c('span',{staticClass:"shrink"},[_vm._v(_vm._s((dom.bytesInUse/1024/1024).toFixed(2))+" MB")]),_vm._v(" "),_c('span',{staticClass:"shrink"},[_vm._v("More")])])})):_vm._e()]),_vm._v(" "),_c('div',{staticClass:"col"},[_c('p',[_vm._v("list of entries")]),_vm._v(" "),_c('p',[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.entryFilter),expression:"entryFilter"}],attrs:{"type":"text","placeholder":"Search"},domProps:{"value":(_vm.entryFilter)},on:{"keyup":_vm.applyEntryFilter,"input":function($event){if($event.target.composing){ return; }_vm.entryFilter=$event.target.value}}})]),_vm._v(" "),(_vm.entryList)?_c('ul',[_vm._l((_vm.entryList),function(list){return [(list.length)?[_c('p',{staticStyle:{"margin":"0"}},[_c('b',[_vm._v(_vm._s(list.domain)+":")])]),_vm._v(" "),_vm._l((list.entries),function(entry){return _c('li',[_vm._v(_vm._s(entry.getValue({stripTags: true}).substring(0,150)))])})]:_vm._e()]})],2):_vm._e()])])])}},
		el: document.getElementById('root'),
		methods: {
			downloadDB() {
				// console.log('download!', this.db);
				// var blob = new Blob([JSON.stringify(this.db)], {type: "application/json"});
				// var url = URL.createObjectURL(blob);
				// chrome.downloads.download({
				// 	url: url,  // The object URL can be used as download URL
				// 	filename: 'typio-export.json'
				// });
			},
			applyEntryFilter() {
				// for(let bucket of this.buckets) {

				// }
				// console.log(this.buckets[0]);

				let max = this.maxResults;

				let res = [];
				for(let buck of this.buckets) {
					if(max < 1) break;
					console.log('max:', max);
					let list = buck.getEntries(max, null, entry => {
						return entry.valueContains(this.entryFilter) !== -1;
					});
					list.domain = buck.domainId;
					max -= list.length;
					res.push(list);
				}
				console.log(res);

				this.entryList = res;

			}
		},
		data: function() {
			return {
				totStats: {},
				domainStats: [],
				buckets: [],
				entryFilter: 'a',
				entryList: null,
				maxResults: 50
			}
		},
		mounted: function() {
			chrome.storage.local.get('dbTotStats', res => this.totStats = res.dbTotStats) || {};
			chrome.storage.local.get('dbDomainStats', res => this.domainStats = res.dbDomainStats || []);

			chrome.storage.local.get(null, storage => {
				let doms = Object.keys(storage);
				console.log(storage);
				for(let dom of doms) {
					if(dom.indexOf('###') === 0) {
						this.buckets.push(new terafm.StorageBucket(dom, {[dom]: storage[dom]}));
						// let buck = new terafm.StorageBucket(dom);
						// buck.set( {[dom]: storage[dom]} );
						// console.log(buck)
						// this.buckets.push(buck);
					}
				}
			});

			setTimeout(() => {
				this.applyEntryFilter();
			}, 500);
		}
	});
})();