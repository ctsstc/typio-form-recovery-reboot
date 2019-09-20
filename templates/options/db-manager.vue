<div>
	<div>
		{{ totStats }}
		<button @click="downloadDB">Download</button>
	</div>
	<div>

		<!--
		<div class="col">
			<p>list of domains</p>
			
			<ul class="domain-list" v-if="domainStats">
				<li v-for="dom in domainStats">
					<span class="grow">{{ dom.domain }}</span>
					<span class="shrink">{{ (dom.bytesInUse/1024/1024).toFixed(2) }} MB</span>
					<span class="shrink">More</span>
				</li>
			</ul>
		</div>
		-->

		<div class="content">
			<h3>Global search</h3>
			<p>Search across all domains you have visited.</p>
			<p><input v-model="entryFilter" v-on:keyup="applyEntryFilter" type="text" placeholder="Search"></p>
			<ul v-if="entryList">
				<template v-for="list of entryList">
					<template v-if="list.length">
						<p style="margin: 0;"><b>{{ list.domain }}:</b></p>
						<li v-for="entry in list.entries">{{ entry.getValue({stripTags: true}).substring(0,150) }}</li>
					</template>
				</template>
			</ul>
			<p v-if="entryFilter.length && !entryList">No entries matched your search. :(</p>
			<p v-if="!entryFilter.length">Type something to search</p>
		</div>

	</div>
</div>