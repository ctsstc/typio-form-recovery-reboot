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

					<div v-if="sesslist !== false">
						<template v-for="sess in sesslist.getArray().reverse()">
							<p v-if="sess.length" class="date-stamp">{{ sess.prettyDate() }}</p>
							<ul v-if="sess.length" class="card-1">
								<li v-for="entry in sess.entries" :data-session-id="entry.sessionId" :data-editable-id="entry.editableId" v-on:click="setEntry($event)">
									<p>{{ entry.getPrintableValue({truncate: 300}) }}</p>
									<div class="meta">
										<div class="left">
											<span v-if="entry.hasEditable()" class="status ok">Target found</span>
											<span v-if="!entry.hasEditable()" class="status bad">Target not found</span>
										</div>
										<div class="right">
											<a class="delete" v-on:click="deleteEntry($event)">
												<span class="text">Delete</span>
											</a>
										</div>
									</div>
								</li>
							</ul>
						</template>
					</div>

					<template v-if="!sesslist || !sesslist.length">
						<p>No entries found.</p>
					</template>

				</div>
			</div>

			<div class="right">
				
				<div class="page page-default" v-bind:class="[(page === 'default' || !page) ? 'page-current' : '' ]">
					<div class="center">
						<span class="icon icon-cloud"></span>

						<p>Select an entry to the left.</p>
						<br>
						<p class="hint">Psst. Did you know about the <a v-on:click="openKeyboardShortcuts()">keyboard shortcuts</a>?</p>
					</div>
				</div>

				<div class="page page-entry" v-bind:class="[(page === 'entry') ? 'page-current' : '' ]" v-if="currEntry">

					<div class="entry-header">
						<template v-if="currEntry.hasEditable()">
							<button class="btn btn-primary" v-on:click="restoreSession()">Restore session</button>
							<button class="btn" v-on:click="restoreEntry()">Restore only this</button>
						</template>
						
						<template v-if="currEntry.obj.type === 'contenteditable'">
							<div class="btn-drop-container" onclick="this.classList.toggle('open')">
								<button class="btn" v-bind:class="[!currEntry.hasEditable() ? 'btn-primary' : '' ]">Copy &#9662;</button>
								<ul class="btn-drop">
									<li v-on:click="copyEntry('plaintext')">Copy plain text</li>
									<li v-on:click="copyEntry('formatting')">Copy with formatting</li>
								</ul>
							</div>
						</template>
						<template v-else>
							<button class="btn" v-on:click="copyEntry('plaintext')" v-bind:class="[!currEntry.hasEditable() ? 'btn-primary' : '' ]">Copy</button>
						</template>

						<p class="message-warn" v-if="!currEntry.hasEditable()"><span class="icon-info"></span>This entry cannot be restored automatically. <a href="#">Why?</a></p>
					</div>

					<div id="entry-text" class="entry-text card-1" v-html="currEntry.getPrintableValue({retainLineBreaks: true})"></div>
					<div id="entry-path" class="entry-meta card-1">
						{{ currEntry.obj.path }} &nbsp; {{ currEntry.obj.type }}
					</div>
				</div>
			</div>	
		</div>
	</div>
</div>