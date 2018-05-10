<div id="quickAccess" v-bind:class="[!isVisible ? 'hidden' : '', ['boundary-' + submenuBoundary]]">

	<p v-if="isEmpty">I found nothing! :(</p>
	
	<template v-for="dataType in Object.keys(data)">
		<ul v-if="data[dataType]" class="entry-list">
			
			<template v-for="entry in data[dataType].entries">
				<entry-item :entry="entry" :editable="editable" :isSess="dataType === 'sess'"></entry-item>
			</template>
		</ul>
	</template>


	<ul class="footer">
		<li>
			<div v-on:click="openRecovery()" class="fill selectable">Browse all entries</div>
			<div v-on:click="openKeyboardShortcutsModal()" class="flex-icon selectable" data-tooltip="Show keyboard shortcuts"><span class="icon-keyboard"></span></div>
			<div v-on:click="disableSite()" class="flex-icon selectable" data-tooltip="Disable Typio on this site"><span class="icon-block"></span></div>
		</li>
	</ul>
</div>

<!-- component template -->
<script type="text/x-template" id="qa-list-item">
	<p>Hello world! {{ testvar }}</p>
</script>