<li v-if="itemType !== 'entry' || (itemType === 'entry' && entry.isTextType())">

	<div @click="commit()" @mouseenter="select" @mouseleave="unselect" v-bind:class="[selected ? 'selected' : '', 'selectable', itemSize && 'size-' + itemSize, 'fill']" :data-tooltip="itemTooltip">
		
		<template v-if="itemType === 'entry'">
			<span v-if="!isSess" class="icon inner-fake-arrow icon-arrow-forward"><span data-tooltip="Restore this entry (this entry was typed in another field)"></span></span>
			<span v-html="entry.getPrintableValue({truncate: 80})"></span>
		</template>

		<template v-if="itemType === 'link' && itemText">
			{{ itemText }}
		</template>
		<template v-if="itemType === 'link' && itemImg">
			<span v-bind:class="['icon', itemImg]"></span>
		</template>
			
	</div>

	<div data-tooltip="Restore just this entry." v-if="isSess" @click="commit(true)" @mouseenter="singleSelect" @mouseleave="unselect" v-bind:class="[singleSelected ? 'selected' : '', 'selectable', itemSize && 'size-' + itemSize, 'flex-icon', 'keyboard-ignore']">
		{{ entry.session.length }}
		<span class="icon icon-arrow-forward"></span>
	</div>

</li>
