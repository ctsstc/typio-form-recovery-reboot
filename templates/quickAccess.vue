<div id="quickAccess" v-bind:class="[!isVisible ? 'hidden' : '']">

	<p v-if="isEmpty" style="margin: 10px; font-weight: bold;">No entries found.</p>
	
	<template v-for="dataType in Object.keys(data)">
		<ul class="entry-list">
			<template v-for="entry in data[dataType].entries">
				<entry-item item-type="entry" :entry="entry" :editable="editable" :isSess="dataType === 'sess'"></entry-item>
			</template>
		</ul>
	</template>

	<ul class="footer">
		<entry-item item-type="link" action="openRecovery" item-text="Browse all entries"></entry-item>
		<entry-item item-size="short" item-type="link" action="openKeyboardModal" item-img="icon-keyboard"></entry-item>
		<entry-item item-size="short" item-type="link" action="disableTypio"  item-img="icon-block"></entry-item>
	</ul>
</div>