<div id="quickAccess" v-bind:class="[!isVisible ? 'hidden' : '', ['boundary-' + submenuBoundary]]">

	<p v-if="isEmpty">I found nothing! :(</p>
	
	<template v-for="dataType in Object.keys(data)">
		<ul class="entry-list">
			<template v-for="entry in data[dataType].entries">
				<entry-item item-type="entry" sub-id="sess" :entry="entry" :editable="editable" :hasSub="submenu.enable && dataType === 'sess'"></entry-item>
			</template>
		</ul>
	</template>

	<ul class="footer">
		<entry-item item-type="link" item-text="More..." has-sub=truesub=true sub-id="footer"></entry-item>
	</ul>

	
	<div v-if="submenu.enable" v-bind:class="[submenu.showId === 'sess' ? 'visible' : '', 'submenu']" :style="{ top: submenu.posY + 'px' }">
		<!-- <p>Entries in this session</p> -->
		<!-- <p>Fields from this session</p> -->
		<ul v-if="submenu.entries">
			<entry-item v-for="subEntry in submenu.entries" item-type="entry" :entry="subEntry" :editable="submenu.editable" :is-sub=true></entry-item>
		</ul>

		<ul v-if="submenu.entries">
			<entry-item item-type="link" action="restoreSession" item-text="Restore all" :entry="subEntry" has-sub=true :is-sub=true></entry-item>
		</ul>
	</div>
	
	<div v-bind:class="[submenu.showId === 'footer' ? 'visible' : '', 'submenu']" :style="{ top: submenu.posY + 'px' }">
		<ul>
			<entry-item item-type="link" action="openRecovery" item-text="Browse all entries" is-sub=true></entry-item>
			<entry-item item-type="link" action="openKeyboardModal" item-text="View keyboard shortcuts" is-sub=true></entry-item>
			<entry-item item-type="link" action="disableTypio" item-text="Disable Typio on this site" is-sub=true></entry-item>
		</ul>
	</div>
</div>

<!-- component template -->
<script type="text/x-template" id="qa-list-item">
	<p>Hello world! {{ testvar }}</p>
</script>