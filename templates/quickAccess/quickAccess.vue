<div id="quickAccess" v-on:mouseleave="unselect(); resetPreview();" v-bind:class="[!isVisible ? 'hidden' : '']">

	<p v-if="isEmpty">I found nothing! :(</p>
	
	<template v-for="dataType in ['sess', 'recent']">
		<ul v-if="data[dataType]" class="entry-list">
			<li v-on:click="restore($event)" v-on:mousemove="preview($event)" v-for="(entry, index) in data[dataType].entries" :data-group="dataType" :data-index="index">
				<div class="value">{{ entry.getPrintableValue({truncate: 50}) }}</div>
				<div v-if="dataType === 'sess'" class="flex-icon" data-action="restore-sess" data-group="single" data-eid="${eid}" title="Restore just this entry"><span class="icon-ios-albums-outline">{{ entry.getSession().length }}</span></div>
			</li>
		</ul>
	</template>


	<ul class="footer">
		<li v-on:click="openRecovery()" v-on:mousemove="preview($event)" class="fill">Browse all entries</li>
		<li v-on:click="openKeyboardShortcutsModal()" v-on:mousemove="preview($event)" class="flex-icon" data-tooltip="Show keyboard shortcuts"><span class="icon-keyboard"></span></li>
		<li v-on:click="disableSite()" v-on:mousemove="preview($event)" class="flex-icon" data-tooltip="Disable Typio on this site"><span class="icon-block"></span></li>
	</ul>
</div>