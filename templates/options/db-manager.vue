<div>
	<p><b>Export database</b></p>
	<button @click="exportToFile">Export database to file</button>


	<br><br><br>
	<p><b>Import database backup</b></p>
	<input ref="fileToImport" type="file" id="selectFiles" value="Import" />
	<button @click="importFromFile">Import file</button>


	<br><br><br>
	<p><b>Handle domain name change</b></p>
	<label for="domainNameChangeInput">Change from:</label>
	<input id="domainNameChangeInput" v-model="domainChangeFrom" list="domainDatalist" placeholder="Current domain name" style="width: 200px">
	<datalist id="domainDatalist">
		<option v-for="domain of domainList" :value="domain.domainName">
	</datalist>
	to:
	<input type="text" v-model="domainChangeTo" placeholder="New domain name" style="width: 200px">
	<button @click="changeDomainName">Change</button>

</div>