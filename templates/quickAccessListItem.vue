<li @click="restore()" @mousemove="preview();" @mouseleave="resetPreview()" v-bind:class="[selected ? 'selected' : '', 'selectable']">

	<div class="fill">{{ entry.getPrintableValue({truncate: 50}) }}</div>
	
	<div v-if="isSess" class="flex-icon">
		<span class="icon icon-arrow-forward">{{ entry.getSession().length }}</span>
	</div>
</li>