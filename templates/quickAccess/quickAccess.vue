<div id="quickAccess" v-on:mouseleave="unselect(); resetPreview();">

	<p v-if="isEmpty">I found nothing! :(</p>
	
	<template v-for="dataType in Object.keys(data)">
		<ul v-if="data[dataType]" class="entry-list">
			<li v-on:click="restore($event)" v-on:mousemove="hoverPreview($event)" v-for="(entry, index) in data[dataType].entries" :data-group="dataType" :data-index="index">
				<div class="value">{{ entry.getPrintableValue({truncate: 50}) }}</div>
				<div v-if="dataType === 'sess'" class="flex-icon" data-action="restore-sess" data-group="single" data-eid="${eid}" title="Restore just this entry"><span class="custom-icon-session">{{ entry.getSession().length }}</span></div>
			</li>
		</ul>
	</template>


	<ul class="footer">';
		<li class="fill" v-on:click="openRecovery()">Browse all entries</li>
		<li class="flex-icon" v-on:click="openKeyboardShortcutsModal()" data-tooltip="Show keyboard shortcuts"><span class="icon-keyboard"></span></li>
		<li class="flex-icon" v-on:click="disableSite()" data-tooltip="Disable Typio on this site"><span class="icon-block"></span></li>
	</ul>
</div>