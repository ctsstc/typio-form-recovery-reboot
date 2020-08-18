<template>
    <div id="recovery-dialog" class="modal-container" v-bind:class="{'hidden': !visible}" v-on:click="backgroundClickHide($event)">
        <div class="modal">

            <div class="header">
                <div class="top-bar">
                    <p>Typio Form Recovery</p>
                    <button class="icon-close" v-on:click="hide()"></button>
                </div>
                <div class="primary">
                    <div class="left">
                        Recover {{ hostname }}
                    </div>
                    <button class="toolbar-icon" v-on:click="disableSite()"><span class="icon-block"></span>Disable on this site</button>
                    <button class="toolbar-icon" v-on:click="openOptions()"><span class="icon-gear"></span>Open settings</button>
                </div>
            </div>

            <div class="panes">
                <div class="left">
                    <div class="header">
                        <div class="filter-box">
                            <input class="filter-input typioIgnoreField" type="text" placeholder="Filter entries" v-model="filterText" v-on:input="populate(true)">
                            <div class="chk-label">
                                <div class="pretty-chk">
                                    <input type="checkbox" id="chk-hide-small-entries" class="typioIgnoreField" v-model="filterShowTextOnly" v-on:change="updateOptsfilterShowTextOnly()">
                                    <div class="fake-chk"></div>
                                </div>
                                <label for="chk-hide-small-entries">Hide non-text entries</label>
                            </div>
                            <span class="icon icon-search"></span>
                        </div>
                        <p class="filter-warning" v-if="filteredCount">{{ filteredCount }} entries hidden - <a v-on:click="resetFilters(); populate(true);">clear filters</a></p>
                    </div>
                    <div class="session-data">

                        <template v-if="sesslist && sesslist.length < 1">
                            <p>No entries found.</p>
                        </template>

                        <template v-if="!sesslist">
                            <p>Loading entries...</p>
                        </template>

                        <div v-if="sesslist !== false">
                            <template v-for="sess in sesslist.getArray().reverse()">
                                <p v-if="sess.length" class="date-stamp">
                                    {{ sess.prettyDate() }}
                                    <template v-if="sess.getFirstEntry().originURL">
                                        &nbsp;&middot;&nbsp;
                                        <a :href="sess.getFirstEntry().originURL" :title="sess.getFirstEntry().originURL">view page</a>
                                    </template>
                                </p>
                                <ul v-if="sess.length" class="card-1">
                                    <li v-for="entry in sess.entries" :data-session-id="entry.sessionId" :data-editable-id="entry.editableId" v-on:click="setEntry($event)">
                                        <p v-html="entry.getPrintableValue({truncate: 300})"></p>
                                        <div class="meta">
                                            <div class="left">
                                                <span v-if="entry.hasEditable()" class="status ok" title="This input entry can be automatically restored to its original input field.">Input field found</span>
                                                <span v-if="!entry.hasEditable()" class="status bad" title="The input field the entry was typed in cannot be found on the current page. Either the field does not exist, or it cannot be found in the same place (path has changed). You can manually restore the entry by copying it.">Cannot be auto-restored</span>
                                            </div>
                                            <div class="right">
                                                <a class="delete" v-on:click="deleteEntry($event)" :class="delConfirmEntry === entry ? 'confirm' : ''">{{ delConfirmEntry === entry ? 'Click to confirm' : 'Delete' }}</a>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </template>
                        </div>

                    </div>
                </div>

                <div class="right">

                    <div class="page page-default" v-bind:class="[(page === 'default' || !page) ? 'page-current' : '' ]">
                        <div class="center">
                            <span class="icon icon-cloud"></span>

                            <p class="bold">Select an entry to the left.</p>
                            <p>Typio has saved <b>{{ stats.countTotEntries }} entries</b> in <b>{{ stats.countTotSessions }} sessions</b> with<br/>a total size of <b>{{ stats.countTotSize }} megabytes</b> for this domain.</p>
                            <p>Psst. Did you know about the <a v-on:click="openKeyboardShortcuts()">keyboard shortcuts</a>?</p>
                        </div>
                    </div>

                    <div class="page page-entry" v-bind:class="[(page === 'entry') ? 'page-current' : '' ]" v-if="currEntry">

                        <div class="entry-header">
                            <template v-if="currEntry.hasEditable()">
                                <button class="btn btn-primary" v-on:click="restoreSession()">Restore session</button>
                                <button class="btn btn-flat" v-on:click="restoreEntry()">Restore only this</button>
                            </template>

                            <template v-if="currEntry.type === 'contenteditable'">
                                <div style="float: right;" class="btn-drop-container" @click="$event.path[0].closest('.btn-drop-container').classList.toggle('open')">
                                    <button class="btn" v-bind:class="[!currEntry.hasEditable() ? 'btn-primary' : 'btn-flat' ]">Copy &#9662;</button>
                                    <ul class="btn-drop">
                                        <li v-on:click="copyEntry('plaintext')">Copy plain text</li>
                                        <li v-on:click="copyEntry('formatting')">Copy with <b>formatting</b></li>
                                        <li v-on:click="copyEntry('html')">Copy as &lt;/HTML&gt;</li>
                                    </ul>
                                </div>
                            </template>
                            <template v-else>
                                <button style="float: right;" class="btn" v-on:click="copyEntry('plaintext')" v-bind:class="[!currEntry.hasEditable() ? 'btn-primary' : 'btn-flat' ]">Copy</button>
                            </template>

                            <p class="message-warn" v-if="!currEntry.hasEditable()"><span class="icon-info"></span> This entry cannot be restored automatically. <a target="_blank" :href="noAutoRestoreHelpLink">Why?</a></p>
                        </div>

                        <iframe ref="entryContentFrame" class="entry-text card-1"></iframe>
                        <div id="entry-path" class="entry-meta card-1">
                            {{ currEntry.path }} &nbsp; {{ currEntry.type }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Options from '../../modules/options/options';
    import db from '../../modules/db/db';
    import Helpers from '../../modules/Helpers';
    import EditableDefaults from '../../modules/EditableDefaults';
    import Cache from '../../modules/Cache';
    import toastController from '../../controllers/content/toastController';
    import keyboardShortcutController from '../../controllers/content/keyboardShortcutController';
    import blockController from '../../controllers/content/blockController';

    export default {
        name: "RecoveryDialog",
        data() {
            return {
                visible: true,
                hostname: window.location.hostname,
                page: 'default',
                selectedListItem: null,

                sesslist: false,
                currEntry: null,

                filteredCount: 0,
                filterShowTextOnly: Options.get('hideSmallEntries'),
                filterText: '',
                noAutoRestoreHelpLink: chrome.runtime.getURL('/html/app.html#/faq#error-cannot-auto-restore'),

                delConfirmEntry: false,

                stats: {
                    countTotSessions: 0,
                    countTotEntries: 0,
                    countTotSize: 0
                }
            }
        },
        mounted: function() {
            document.activeElement.blur();
            this.populate();
        },
        methods: {
            hide: function() {
                this.visible = false;
            },
            backgroundClickHide: function(e) {
                if(e.path[0].classList.contains('modal-container')) this.hide();
            },
            show: function() {
                if(this.visible) return;
                this.visible = true;
                this.populate();
            },
            setEntry: function(e) {
                let target = e.path[0];
                if(!target.matches('li')) target = target.closest('li');

                this.currEntry = this.sesslist.getEntry(target.dataset.sessionId, target.dataset.editableId);
                this.page = 'entry';

                setTimeout(() => {
                    const style = '<style>body { margin: 0; font-fanily: sans-serif; }</style>';
                    this.$refs.entryContentFrame.contentWindow.document.body.innerHTML = style + this.currEntry.getValue();
                }, 50) 

                if(this.selectedListItem) this.selectedListItem.classList.remove('selected');
                this.selectedListItem = target;
                this.selectedListItem.classList.add('selected');
            },
            setDefaultPage: function() {
                this.currEntry = null;
                this.page = 'default';
                if(this.selectedListItem) {
                    this.selectedListItem.classList.remove('selected');
                    this.selectedListItem = null;
                }
            },

            // Callback for failures?
            restoreSession: function() {
                if(!this.currEntry) return;
                EditableDefaults.restore();
                // Don't use this.currEntry.getSession(), entries could be filtered out!
                const sess = db.getSession(this.currEntry.sessionId);
                sess.restore({ flash: true }, db);
                toastController.create('Session restored.');
                this.hide();
            },
            restoreEntry: function() {
                if(!this.currEntry) return;
                EditableDefaults.restore();
                this.currEntry.restore({ flash: true }, db);
                toastController.create('Entry restored.');
                this.hide();
            },

            populate: function(opts = {scrollTop: false}) {
                this.setDefaultPage();

                db.fetch().then(() => {
                    Cache.wipeCache();
                    this.sesslist = db.getSessions();

                    this.stats.countTotSessions = this.sesslist.length;
                    this.stats.countTotEntries = this.sesslist.countEntries();
                    db.getDomainSize().then(bytes => this.stats.countTotSize = Number(bytes/1024/1024).toFixed(2));

                    if(this.filterShowTextOnly || this.filterText.length > 1) {
                        this.sesslist = this.sesslist.filterEntries(entry => {
                            if(this.filterText.length > 1) {
                                if(entry.value.toLowerCase().indexOf(this.filterText.toLowerCase()) === -1) return null;
                            }

                            if(this.filterShowTextOnly) {
                                if(!entry.isTextType()) return null;
                            }
                        });
                        this.filteredCount = this.stats.countTotEntries - this.sesslist.countEntries();
                    } else {
                        this.filteredCount = 0;
                    }

                    if(opts.scrollTop) this.scrollTop();

                });
            },
            scrollTop: function() {
                this.$el.querySelector('.session-data').scrollTop = 0;
            },
            updateOptsfilterShowTextOnly: function() {
                this.populate();
                Options.set('hideSmallEntries', this.filterShowTextOnly);
            },
            resetFilters: function() {
                this.filterText = '';
                this.filterShowTextOnly = false;
            },

            deleteEntry: function(e) {
                let target = e.path[0], li, entry;
                if(!target.matches('.delete')) target = target.closest('.delete');
                li = target.closest('li');
                entry = this.sesslist.getEntry(li.dataset.sessionId, li.dataset.editableId);

                if(!entry) return;
                clearTimeout(this.tmpDelTimeout);

                if(this.delConfirmEntry === entry) {
                    db.deleteEntry(li.dataset.sessionId, li.dataset.editableId, () => {
                        this.populate();
                        this.delConfirmEntry = false;
                    });

                } else {
                    this.delConfirmEntry = entry;
                    this.$forceUpdate();

                    this.tmpDelTimeout = setTimeout(() => {
                        this.delConfirmEntry = false;
                        this.$forceUpdate();
                    }, 4000);
                }

                e.stopPropagation();
                return;



                if(!target.classList.contains('confirm')) {
                    target.classList.add('confirm');
                    target.querySelector('.text').innerText = 'Click to confirm';

                    setTimeout(function() {
                        target.classList.remove('confirm');
                        target.querySelector('.text').innerText = 'Delete';
                    }, 4000);
                } else {
                    let li = target.closest('li');

                    db.deleteEntry(li.dataset.sessionId, li.dataset.editableId, () => {
                        this.populate();

                        // Vue will re-use other elements and change the text in them
                        // instead of creating new ones, so the make sure the .confirm class
                        // is removed if the li element was re-used
                        let delLink = li && li.querySelector('.meta .delete.confirm');
                        if(delLink) delLink.classList.remove('confirm');
                    });
                }
            },

            openKeyboardShortcuts: function() {
                this.hide();
                keyboardShortcutController.showShortcutDialog();
            },

            copyEntry: function(format) {
                if(!this.currEntry) return;

                if(format === 'plaintext') {
                    Helpers.copyToClipboard(this.currEntry.getValue({stripTags: true, trim: true}));
                    toastController.create('Copied plaintext to clipboard');

                } else if(format === 'formatting') {
                    const frameDocument = this.$refs.entryContentFrame.contentWindow.document;
                    frameDocument.execCommand('selectAll');
                    frameDocument.execCommand('copy');
                    frameDocument.getSelection().empty()
                    toastController.create('Copied text with formatting to clipboad');
                } else if(format === 'html') {
                    Helpers.copyToClipboard(this.currEntry.getValue({trim: true}));
                    toastController.create('Copied HTML to clipboard');
                }

            },

            openOptions: function() {
                chrome.runtime.sendMessage({action: 'openSettings'});
            },
            disableSite: function() {
                if(blockController.block()) this.hide();
            },
        },
    }
</script>

<style scoped>

</style>