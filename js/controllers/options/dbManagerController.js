
;(function() {

	let vue = new Vue({
		'@import-vue options/db-manager':0,
		el: document.getElementById('root'),
		methods: {
			downloadDB() {

				chrome.permissions.request({
					permissions: ['downloads'],
					//origins: ['http://www.google.com/']
				}, function(granted) {
					// The callback argument will be true if the user granted the permissions.
					if (granted) {
						console.log('download!', this.db);
						const blob = new Blob([JSON.stringify(this.db)], {type: "application/json"});
						const url = URL.createObjectURL(blob);
						chrome.downloads.download({
							url: url,  // The object URL can be used as download URL
							filename: 'typio-export.json'
						});
					} else {
						console.log('noo');
					}
				});
			},
			applyEntryFilter() {
				if(this.entryFilter) {
					let max = this.maxResults;

					let res = [];
					for(let buck of this.buckets) {
						if(max < 1) break;

						// Todo: Figure out why search does not return results correctly (max 1 result per domain?)
						let list = buck.getEntries(null, null, entry => {
							return entry.valueContains(this.entryFilter) !== -1;
						});
						list.domain = buck.domainId;
						console.log(list.length);
						max -= list.length;
						res.push(list);
					}
					console.log(res);

					this.entryList = res;
				} else {
					this.entryList = [buck.getEntries(null, null, entry => {
						return entry.valueContains(this.entryFilter) !== -1;
					})];
				}

			}
		},
		data: function() {
			return {
				totStats: {},
				domainStats: [],
				buckets: [],
				entryFilter: '',
				entryList: null,
				maxResults: 10
			}
		},
		mounted: function() {
			chrome.storage.local.get('dbTotStats', res => this.totStats = res.dbTotStats) || {};
			chrome.storage.local.get('dbDomainStats', res => this.domainStats = res.dbDomainStats || []);
1
			console.log(this.domainStats);

			chrome.storage.local.get(null, storage => {
				let doms = Object.keys(storage);
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
		}
	});
})();