<li v-if="itemType !== 'entry' || (itemType === 'entry' && entry.isTextType())" @click="commit()" @mouseenter="select" @mouseleave="unselect" v-bind:class="[selected ? 'selected' : '', 'selectable']">
	
	<template v-if="itemType === 'entry'">
		<div class="fill">{{ entry.getPrintableValue({truncate: 50}) }}</div>
	</template>

	<template v-if="itemType === 'link'">
		<div class="fill">{{ itemText }}</div>
	</template>
	
	<div v-if="isSess" class="flex-icon thin">
		<span class="icon icon-arrow-forward"><!-- {{ entry.session.length }} --></span>
	</div>
</li>