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
				<button class="toolbar-icon"><span class="icon-block"></span>Disable on this site</button>
				<button class="toolbar-icon"><span class="icon-gear"></span>Open settings</button>
			</div>
		</div>

		<div class="panes">
			<div class="left">
				<div class="header">
					<div class="filter-box">
						<input class="filter-input typioIgnoreField" type="text" placeholder="Filter entries" v-model="filterText" v-on:input="populate()">
						<div class="chk-label">
							<div class="pretty-chk">
								<input type="checkbox" id="chk-hide-small-entries" class="typioIgnoreField" v-model="filterSmallEntries" v-on:change="updateOptsFilterSmallEntries()">
								<div class="fake-chk"></div>
							</div>
							<label for="chk-hide-small-entries">Hide small entries</label>
						</div>
						<span class="icon icon-search"></span>
					</div>
					<p class="filter-warning" v-if="filteredCount">{{ filteredCount }} entries filtered - <a v-on:click="filterSmallEntries = false; filterText = ''; populate();">clear filters</a></p>
				</div>
				<div class="session-data">

					<template v-if="totalEntries" v-for="sess in sesslist.sessions">
						<p v-if="sess.length" class="date-stamp">{{ sess.prettyDate() }}</p>
						<ul v-if="sess.length" class="card-1">
							<li v-for="entry in sess.entries" :data-session-id="entry.sessionId" :data-editable-id="entry.editableId" v-on:click="setEntry($event)">
								<p>{{ entry.getValue({encode: true, truncate: 300}) }}</p>
								<div class="meta">
									<div class="left">
										<span v-if="entry.hasEditable()" class="status found">Target found</span>
										<span v-if="!entry.hasEditable()" class="status not-found">Target not found</span>
									</div>
									<div class="right">
										<a class="delete" v-on:click="deleteEntry($event)">
											<i class="icon-trash"></i> <span class="text">Delete</span>
										</a>
									</div>
								</div>
							</li>
						</ul>
					</template>
					<template v-if="totalEntries === 0">
						<p>No entries found.</p>
					</template>

				</div>
			</div>

			<div class="right">
				
				<div class="page page-default" v-bind:class="[(page === 'default' || !page) ? 'page-current' : '' ]">
					<div class="center">
						<svg class="icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h48v48h-48z" fill="none"></path><path d="M25.99 6c-9.95 0-17.99 8.06-17.99 18h-6l7.79 7.79.14.29 8.07-8.08h-6c0-7.73 6.27-14 14-14s14 6.27 14 14-6.27 14-14 14c-3.87 0-7.36-1.58-9.89-4.11l-2.83 2.83c3.25 3.26 7.74 5.28 12.71 5.28 9.95 0 18.01-8.06 18.01-18s-8.06-18-18.01-18zm-1.99 10v10l8.56 5.08 1.44-2.43-7-4.15v-8.5h-3z"></path></svg>

						<p>Select an entry to the left.</p>
						<br>
						<p>Psst. Did you know about the <a v-on:click="openKeyboardShortcuts()">keyboard shortcuts</a>?</p>
					</div>
				</div>

				<div class="page page-entry" v-bind:class="[(page === 'entry') ? 'page-current' : '' ]" v-if="currEntry">

					<div class="entry-header">
						<template v-if="currEntry.hasEditable()">
							<button class="btn btn-primary" v-on:click="restoreSession()">Restore session</button>
							<button class="btn" v-on:click="restoreEntry()">Restore only this</button>
						</template>

						<div class="btn-drop-container">
							<button class="btn">Copy &#9662;</button>
							<ul class="btn-drop">
								<li v-on:click="copyEntry('plaintext')">Copy plain text</li>
								<li v-on:click="copyEntry('formatting')">Copy with formatting</li>
							</ul>
						</div>

						<p class="message" v-if="currEntry.hasEditable()">This entry can be restored automatically.</p>
						<p class="message" v-if="!currEntry.hasEditable()"><span class="icon-trash"></span>This entry cannot be restored automatically.</p>
					</div>

					<div id="entry-text" class="entry-text card-1">{{ currEntry.getValue({encode: true}) }}</div>
					<div id="entry-path" class="entry-meta card-1">{{ currEntry.obj.path }}</div>
				</div>
			</div>	
		</div>
	</div>
</div>