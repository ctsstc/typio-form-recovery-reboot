<li v-if="itemType !== 'entry' || (itemType === 'entry' && entry.isTextType())" @click="commit()" @mouseenter="select" @mouseleave="unselect" v-bind:class="[selected ? 'selected' : '', 'selectable', itemSize && 'size-' + itemSize]">
	
	<template v-if="itemType === 'entry'">
		<div class="fill">{{ entry.getPrintableValue({truncate: 50}) }}</div>
	</template>

	<template v-if="itemType === 'link' && itemText">
		<div class="fill">{{ itemText }}</div>
	</template>
	<template v-if="itemType === 'link' && itemImg">
		<span v-bind:class="['icon', itemImg]"></span>
	</template>

	<div v-if="isSess" class="flex-icon thin">
		{{ entry.session.length }}
		<span class="icon icon-arrow-forward"></span>
	</div>
</li>