<li @click="restore()" @mouseenter="preview()" @mouseleave="resetPreview()" v-bind:class="[selected ? 'selected' : '', 'selectable']">

	<div class="fill">{{ entry.getPrintableValue({truncate: 50}) }}</div>
	
	<div v-if="isSess" class="flex-icon">
		<span class="icon icon-arrow-forward"></span>
	</div>
	
	<ul v-if="isSess" class="submenu">
		<template v-for="subEntry in entry.getSession().entries">
			<entry-item :entry="subEntry" :editable="editable" :isSess="false"></entry-item>
		</template>
	</ul>
</li>