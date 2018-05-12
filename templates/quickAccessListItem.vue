<li @click="commit()" @mouseenter="select" @mouseleave="unselect" v-bind:class="[selected ? 'selected' : '', 'selectable']">
	
	<template v-if="itemType === 'entry'">
		<div class="fill">{{ entry.getPrintableValue({truncate: 50}) }}</div>

		<div v-if="isSub" class="flex-icon thin">
			<span :class="[entry.hasEditable() ? 'status ok' : 'status bad']"></span>
		</div>
	</template>

	<template v-if="itemType === 'link'">
		<div class="fill">{{ itemText }}</div>
	</template>
	
	<div v-if="hasSub" class="flex-icon thin">
		<span class="icon icon-arrow-forward"></span>
	</div>
</li>