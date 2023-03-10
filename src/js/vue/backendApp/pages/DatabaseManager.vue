<template>
    <div>
        <h1>Datbase manager</h1>

        <div class="card">
            <div style="background: rgb(226 226 226); padding: 15px">
                <h2>These features are experimental.</h2>
                <p>The features on this page have NOT gone through extensive testing and might not function as expected. Use at your own risk.</p>
            </div>
            <br>

            <p><b>Export database</b></p>
            <button @click="exportToFile">Export database to file</button>


            <br><br><br>
            <p><b>Import database backup</b></p>
            <input ref="fileToImport" type="file" id="selectFiles" value="Import" />
            <button @click="importFromFile">Import file</button>


            <br><br><br>
            <p><b>Handle domain name change</b></p>
            <p>Please note that any existing data for the new domain will be replaced with the old - the data will *not* be merged.</p>

            <form @submit="changeDomainName">
                <label for="domainNameChangeInput">Change from:</label>
                <input id="domainNameChangeInput" v-model="domainChangeFrom" list="domainDatalist" placeholder="Current domain name" style="width: 200px">
                <datalist id="domainDatalist">
                    <option v-for="domain of domainList" :value="domain.domainName"></option>
                </datalist>
                to:
                <input type="text" v-model="domainChangeTo" placeholder="New domain name" style="width: 200px">
                <button>Change</button>
            </form>
        </div>
    </div>
</template>

<script>
    import StorageBucket from '../../../classes/StorageBucket';

    let buckets = [];
    export default {
        name: "DatabaseManager",
        data() {
            return {
                hasBuckets: false,
                entryFilter: '',
                entryList: null,
                maxResults: 10,

                domainChangeFrom: null,
                domainChangeTo: null,
            }
        },
        mounted() {
            this.loadBuckets();
        },
        methods: {
            loadBuckets() {
                this.hasBuckets = false;
                chrome.storage.local.get(null, storage => {
                    let doms = Object.keys(storage);
                    buckets = [];
                    for(let dom of doms) {
                        if(dom.indexOf('###') === 0) {
                            buckets.push(new StorageBucket(dom, {[dom]: storage[dom]}));
                        }
                    }
                    this.hasBuckets = true;
                });
            },
            importFromFile() {
                const files = this.$refs.fileToImport.files;

                if (files.length !== 1) {
                    return alert('Please select a file to import.');
                }

                if(!confirm("Importing a database will OVERRIDE the existing database. This is non-reversible. Do you want to continue?")) {
                    return false;
                }

                const fileReader = new FileReader();

                fileReader.onload = function(e) {
                    const arr = JSON.parse(e.target.result);

                    if(arr.length) {
                        let write = {};
                        for(const domain of arr) {
                            if(domain.hasOwnProperty('domainId') && domain.hasOwnProperty('context')) {
                                write[domain.domainId] = domain.context[domain.domainId];
                            }
                        }
                        chrome.storage.local.set(write)
                        alert('File was successfully imported.');
                    }
                }

                fileReader.readAsText(files.item(0));
            },
            exportToFile() {
                chrome.permissions.request({
                    permissions: ['downloads'],
                }, function(granted) {
                    // The callback argument will be true if the user granted the permissions.
                    if (granted) {
                        const blob = new Blob([JSON.stringify(buckets)], {type: "application/json"});
                        const url = URL.createObjectURL(blob);

                        const d = new Date();
                        const filename = 'Typio Export ' + d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear() + '.json';
                        chrome.downloads.download({
                            url: url,
                            filename: filename
                        });
                    }
                });
            },
            changeDomainName(e) {
                e.preventDefault();

                if(this.domainExists(this.domainChangeFrom) !== true) {
                    return alert('There is no data saved for the selected domain. Did you spell it correctly?');
                }
                if(this.isValidDomain(this.domainChangeTo) !== true) {
                    return alert('The new domain name is not valid.');
                }

                const newDomainId = '###' + this.domainChangeTo;

                const bucket = buckets.filter(bucket => {
                    return bucket.domainId === '###' + this.domainChangeFrom
                })[0];

                chrome.storage.local.get(bucket.domainId, copy => {
                    copy[newDomainId] = copy[bucket.domainId];
                    delete copy[bucket.domainId];

                    chrome.storage.local.set(copy, () => {
                        chrome.storage.local.remove(bucket.domainId);
                        alert(this.domainChangeFrom + ' has been renamed to ' + this.domainChangeTo);
                        this.loadBuckets();

                        this.domainChangeFrom = null;
                        this.domainChangeTo = null;
                    });
                });

            },
            applyEntryFilter() {
                if(this.entryFilter) {
                    let max = this.maxResults;

                    let res = [];
                    for(let buck of buckets) {
                        if(max < 1) break;

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

            },
            domainExists(needle) {
                return this.domainList.filter(domain => {
                    return domain.domainName === needle
                }).length > 0;
            },
            isValidDomain(domain) {
                return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(domain);
            },
        },
        computed: {
            buckets() {
                return this.hasBuckets ? buckets : null;
            },
            domainList() {
                const list = [];
                for(const bucketIndex in this.buckets) {
                    const bucket = buckets[bucketIndex];

                    list.push({
                        domainName: bucket.domainId.replace('###', ''),
                        domainId: bucket.domainId,
                        index: bucketIndex,
                    })
                }

                return list;
            }
        },
    }
</script>

<style scoped>

</style>