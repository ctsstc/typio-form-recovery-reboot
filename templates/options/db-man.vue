<div class="content">
	<p><button id="btn-download" v-on:click="downloadDB">Download DB</button> <button id="btn-import">Import DB</button></p>
	
	
	<p>Typio has saved {{ totStats.entries }} entries in {{ totStats.sessions }} sessions in {{ totStats.fields }} input fields in {{ totStats.domains }} domains taking up {{ (totStats.bytesInUse/1024/1024).toFixed(2) }} MB of storage.</p>
	<ul>
		<li v-for="dom of domainStats.slice(0,5)">
			{{ dom.domain }} - {{ (dom.bytesInUse/1024/1024).toFixed(2) }} MB
		</li>
	</ul>
	
</div>