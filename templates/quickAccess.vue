<div id="quickAccess" v-on:mouseleave="unselect(); resetPreview();" v-bind:class="[!isVisible ? 'hidden' : '', ['boundary-' + submenuBoundary]]">

	<p v-if="isEmpty">I found nothing! :(</p>

	<some-component></some-component>
	
	<template v-for="dataType in Object.keys(data)">
		<ul v-if="data[dataType]" class="entry-list">
			<li v-for="(entry, index) in data[dataType].entries">
				<div :data-todo="entry.editableId + ' ' + entry.sessionId" v-on:click="restore($event)" v-on:mousemove="preview($event)" :data-group="dataType" :data-index="index" class="fill selectable">
					{{ entry.getPrintableValue({truncate: 50}) }}
				</div>
				
				<div v-if="dataType === 'sess'" class="flex-icon">
					<span class="icon icon-arrow-forward"></span>
				</div>
				
				<ul class="submenu" v-if="dataType === 'sess'">
					<li v-for="(subentry, subindex) in entry.getSession().entries" v-on:click="restore($event)" v-on:mousemove="preview($event)" data-group="sess" data-single="true" :data-index="subindex" data-keynav-skip="" class="selectable">
						{{ subentry.getPrintableValue({truncate: 50}) }}
					</li>
				</ul>
			</li>
		</ul>
	</template>


	<ul class="footer">
		<li>
			<div v-on:click="openRecovery()" v-on:mousemove="preview($event)" class="fill selectable">Browse all entries</div>
			<div v-on:click="openKeyboardShortcutsModal()" v-on:mousemove="preview($event)" class="flex-icon selectable" data-tooltip="Show keyboard shortcuts"><span class="icon-keyboard"></span></div>
			<div v-on:click="disableSite()" v-on:mousemove="preview($event)" class="flex-icon selectable" data-tooltip="Disable Typio on this site"><span class="icon-block"></span></div>
		</li>
	</ul>
</div>

<!-- component template -->
<script type="text/x-template" id="qa-list-item">
	<p>Hello world! {{ testvar }}</p>
</script>