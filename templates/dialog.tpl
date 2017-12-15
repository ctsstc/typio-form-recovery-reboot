<div class="dialog-root">
	<div class="dialog-overlay trigger-close-dialog"></div>
	<div class="dialog-container">

		<div class="top-bar">
			Typio Form Recovery
			<svg class="close-btn trigger-close-dialog" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="info"/><g id="icons"><path d="M14.8,12l3.6-3.6c0.8-0.8,0.8-2,0-2.8c-0.8-0.8-2-0.8-2.8,0L12,9.2L8.4,5.6c-0.8-0.8-2-0.8-2.8,0   c-0.8,0.8-0.8,2,0,2.8L9.2,12l-3.6,3.6c-0.8,0.8-0.8,2,0,2.8C6,18.8,6.5,19,7,19s1-0.2,1.4-0.6l3.6-3.6l3.6,3.6   C16,18.8,16.5,19,17,19s1-0.2,1.4-0.6c0.8-0.8,0.8-2,0-2.8L14.8,12z" id="exit"/></g></svg>
		</div>
		
		<div class="left-pane">
			<div class="header">
				<div class="header-inner">
					<p class="primary">
						Recover {{ hostname }}
					</p>
				</div>
			</div>
			<div class="content">
				<div class="filter">
					Filter:
					<input type="checkbox" id="hideSmallEntries" class="toggleHideSmallEntries typioIgnoreField">
					<label for="hideSmallEntries">Hide small entries</label>
				</div>

				<div class="recovery-container"></div>
			</div>
		</div>

		<div class="right-pane">
			
			<div class="header">
				<div class="header-inner">

					<span class="settings-btn" data-set-page="settings" >
						<svg version="1.1" viewBox="0 0 48 50" width="48px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M39.964,18.432c-0.192-0.476-0.284-0.938-0.517-1.392l4.238-7.648l-1.838-1.87l-1.387-1.401L38.6,4.252  l-8.193,4.727c-0.048-0.019-0.096-0.026-0.144-0.029L27.635,0h-2.644H24h-0.991h-2.644l-2.628,8.95  c-0.048,0.002-0.096,0.01-0.144,0.029L9.4,4.252l-1.861,1.87L6.152,7.523l-1.838,1.87l4.238,7.648  c-0.232,0.454-0.324,0.916-0.517,1.392L0,20.865v2.644v1.982v2.644l7.626,2.314c0.224,0.682,0.245,1.342,0.547,1.984l-3.921,7.184  l1.87,1.877l1.401,1.417l1.869,1.901l7.181-3.859c0.462,0.218,0.936,0.539,1.419,0.716L20.365,50h2.644H24h0.991h2.644l2.373-8.331  c0.483-0.177,0.957-0.498,1.419-0.716l7.181,3.859l1.869-1.901l1.401-1.417l1.87-1.877l-3.921-7.184  c0.302-0.643,0.323-1.303,0.547-1.984L48,28.135v-2.644v-1.982v-2.644L39.964,18.432z M24,33.475c-4.736-0.261-8.5-4.174-8.5-8.975  c0-4.801,3.764-8.714,8.5-8.975c4.736,0.261,8.5,4.173,8.5,8.975C32.5,29.301,28.736,33.214,24,33.475z"/></svg>
					</span>
					
					<div class="header-partial partial-recover">
						<button class="trigger-recover-session primary health-ok" title="Restore everything you typed that page load">Restore session</button>
						<button class="trigger-recover-single health-ok" title="Restore just this entry">Restore just this</button>
						<button class="trigger-copy health-ok icon-btn" title="Copy text to clipboard">Copy</button>
						<button class="trigger-copy health-bad primary" title="Copy text to clipboard (The original input field does not exist anymore or has been moved.)">Copy to clipboard</button>
						&nbsp;<!-- Can't figure out why but without this a single button gets top-aligned on some sites.  -->
					</div>

					<div class="header-partial partial-settings">
						<p class="primary">Site settings</p>
					</div>

					<div class="header-partial partial-default partial-current">
						<p class="primary"></p>
					</div>

				</div>
			</div>

			<div class="content">
				<div class="content-partial partial-recover">
					<div class="meta">

						<div class="stat-container">
							<svg version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="info"/><g id="icons"><g id="time"><path d="M12,0C5.4,0,0,5.4,0,12c0,6.6,5.4,12,12,12s12-5.4,12-12C24,5.4,18.6,0,12,0z M12,21c-5,0-9-4-9-9c0-5,4-9,9-9s9,4,9,9    C21,17,17,21,12,21z"/><path d="M14,11.2V7c0-1.1-0.9-2-2-2s-2,0.9-2,2v5c0,0.5,0.2,1,0.6,1.4l3,3C14,16.8,14.5,17,15,17s1-0.2,1.4-0.6    c0.8-0.8,0.8-2,0-2.8L14,11.2z"/></g></g></svg>
							<span class="date"></span>
						</div>

						<div class="stat-container" title="Name of the field type">
							<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDY0IDY0IiBoZWlnaHQ9IjY0cHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA2NCA2NCIgd2lkdGg9IjY0cHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxwYXRoIGQ9Ik0yMi41MjcsNDYuOTE2TDAsMzUuMTkzdi01LjEyOWwyMi41MjctMTEuNzcxdjYuNjM2TDYuNzczLDMyLjcwN2wxNS43NTQsNy41NjhWNDYuOTE2eiBNMzkuNjEzLDEybC05LjU1OSw0MmgtNS41NzggIGw5LjU1OS00MkgzOS42MTN6IE01Ny4yMjksMzIuNzA3TDQxLjQ3MywyNC45M3YtNi42MzZMNjQsMzAuMDY0djUuMTI5TDQxLjQ3Myw0Ni45MTZ2LTYuNjQxTDU3LjIyOSwzMi43MDd6Ii8+PC9zdmc+" alt="HTML icon" />
							<span class="type"></span>
						</div>

						<div class="health-ok stat-container" title="Target input field was found. This means you can automatically restore the text if you wish.">
							<svg version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path clip-rule="evenodd" d="M21.652,3.211c-0.293-0.295-0.77-0.295-1.061,0L9.41,14.34  c-0.293,0.297-0.771,0.297-1.062,0L3.449,9.351C3.304,9.203,3.114,9.13,2.923,9.129C2.73,9.128,2.534,9.201,2.387,9.351  l-2.165,1.946C0.078,11.445,0,11.63,0,11.823c0,0.194,0.078,0.397,0.223,0.544l4.94,5.184c0.292,0.296,0.771,0.776,1.062,1.07  l2.124,2.141c0.292,0.293,0.769,0.293,1.062,0l14.366-14.34c0.293-0.294,0.293-0.777,0-1.071L21.652,3.211z" fill-rule="evenodd"/></svg>
							<span class="text">Target found</span>
						</div>
						<div class="health-bad stat-container" title="The original input field does not exist anymore. Copy the text and paste it manually.">
							<svg version="1.1" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" xmlns:xlink="http://www.w3.org/1999/xlink"><title/><defs/><g fill="none" fill-rule="evenodd" id="Icons with numbers" stroke="none" stroke-width="1"><g fill="#dc9527" id="Group" transform="translate(-96.000000, -432.000000)"><path d="M103,443 L103,445 L105,445 L105,443 Z M104,448 C99.5817218,448 96,444.418278 96,440 C96,435.581722 99.5817218,432 104,432 C108.418278,432 112,435.581722 112,440 C112,444.418278 108.418278,448 104,448 Z M103,435 L103,442 L105,442 L105,435 Z M103,435" id="Oval 208 copy"/></g></g></svg>
							<span class="text">Target not found</span>
						</div>

					</div>
					<div class="full-text">
						<button class="trigger-copy" title="Copy text to clipboard">Copy to clipboard</button>
						<div class="container">
							Text goes here
						</div>
					</div>

					<div class="editable-path"></div>
				</div>
				<div class="content-partial partial-settings">
					<div class="inner-content">
						<h2>Site settings</h2>
						<p><a class="trigger-delete-all">Delete all</a> saved data for this site.</p>
						<p><a class="trigger-blacklist">Disable Typio on this site (add to blacklist)</a></p>

						<br/>

						<h2>Extension settings</h2>
						<p><a class="trigger-open-extension-settings">Click here</a> to open extension settings.</p>
						<p></p>

						<br/><hr>
						<p>Leave feedback or feature requests on our <a target="_blank" href="https://bitbucket.org/nicklassandell/chrome-form-recovery/issues?status=new&status=open">bitbucket page</a>. Are you a developer? Typio Form Recovery is open source, feel free to contribute!</p>
					</div>
				</div>
				<div class="content-partial partial-default partial-current">
					<div class="centered">
						<svg class="big-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h48v48h-48z" fill="none"/><path d="M25.99 6c-9.95 0-17.99 8.06-17.99 18h-6l7.79 7.79.14.29 8.07-8.08h-6c0-7.73 6.27-14 14-14s14 6.27 14 14-6.27 14-14 14c-3.87 0-7.36-1.58-9.89-4.11l-2.83 2.83c3.25 3.26 7.74 5.28 12.71 5.28 9.95 0 18.01-8.06 18.01-18s-8.06-18-18.01-18zm-1.99 10v10l8.56 5.08 1.44-2.43-7-4.15v-8.5h-3z"/></svg>
						<p>Select an entry to the left or view the <a data-set-page="settings">settings</a> for this domain.</p>
						<p class="hint">Hint: Use <span class="key">Ctrl</span> + <span class="key">Del</span> to open recovery at any time. Press twice to auto restore last session.</p>
					</div>
				</div>
			</div>

		</div>
	</div>
</div>