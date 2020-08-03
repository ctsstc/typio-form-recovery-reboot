<div>
	<h1>These features are experimental.</h1>
	<p>The features on this page have not gone through proper testing and might not function as expected. Use at your own risk.</p>
	<br><br><br>

	<p><b>Export database</b></p>
	<button @click="exportToFile">Export database to file</button>


	<br><br><br>
	<p><b>Import database backup</b></p>
	<input ref="fileToImport" type="file" id="selectFiles" value="Import" />
	<button @click="importFromFile">Import file</button>


	<br><br><br>
	<p><b>Handle domain name change</b></p>
	<p>Please note that any existing data for the new domain will be replaced with the old - the data will *not* be merged.</p>

	<form @submit="changeDomainName">
		<label for="domainNameChangeInput">Change from:</label>
		<input id="domainNameChangeInput" v-model="domainChangeFrom" list="domainDatalist" placeholder="Current domain name" style="width: 200px">
		<datalist id="domainDatalist">
			<option v-for="domain of domainList" :value="domain.domainName">
		</datalist>
		to:
		<input type="text" v-model="domainChangeTo" placeholder="New domain name" style="width: 200px">
		<button>Change</button>
	</form>

</div>