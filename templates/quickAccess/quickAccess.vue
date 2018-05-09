<div id="quickAccess" v-on:mouseleave="unselect(); resetPreview();" v-bind:class="[!isVisible ? 'hidden' : '']">

	<p v-if="isEmpty">I found nothing! :(</p>
	
	<template v-for="dataType in Object.keys(data)">
		<ul v-if="data[dataType]" class="entry-list">
			<li v-for="(entry, index) in data[dataType].entries">
				<div :data-todo="entry.editableId + ' ' + entry.sessionId" v-on:click="restore($event)" v-on:mousemove="preview($event)" :data-group="dataType" :data-index="index" class="fill selectable">
					{{ entry.getPrintableValue({truncate: 50}) }}
				</div>
				
				<div v-if="dataType === 'sess'" v-on:click="restore($event)" v-on:mousemove="preview($event)" data-group="sess" data-single="true" :data-index="index" :title="'This entry belongs to a session with ' + entry.getSession().length + ' entries. Click this icon to restore only the entry that belongs to the field.'" data-keynav-skip="" class="flex-icon sess-count-icon selectable">
					<span class="icon icon-square"></span>
					<span class="num">{{ entry.getSession().length }}</span>
				</div>
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