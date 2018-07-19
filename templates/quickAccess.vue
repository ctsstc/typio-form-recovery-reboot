<div id="quickAccess" v-bind:class="[!isVisible ? 'hidden' : '', ['boundary-' + submenuBoundary]]">

	<p v-if="isEmpty" style="margin: 10px; font-weight: bold;">No entries found.</p>
	
	<template v-for="dataType in Object.keys(data)">
		<ul class="entry-list">
			<template v-for="entry in data[dataType].entries">
				<entry-item item-type="entry" :entry="entry" :editable="editable" :isSess="dataType === 'sess'"></entry-item>
			</template>
		</ul>
	</template>

	<ul class="footer">
		<entry-item item-type="link" item-text="More..." sub-id="footer"></entry-item>
	</ul>
	
	<div v-bind:class="['submenu', submenu.showId === 'footer' ? 'visible' : '']" :style="{ top: submenu.posY + 'px' }">
		<ul>
			<entry-item is-sub=true item-type="link" action="openRecovery" item-text="Browse all entries"></entry-item>
			<entry-item is-sub=true item-type="link" action="openKeyboardModal" item-text="View keyboard shortcuts"></entry-item>
			<entry-item is-sub=true item-type="link" action="disableTypio" item-text="Disable Typio on this site"></entry-item>
		</ul>
	</div>
</div>