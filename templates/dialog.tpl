<style> @import url("{{ cssPath }}"); </style>

<div class="shadow-root">
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
			<div class="recovery-container"></div>
		</div>

		<div class="right-pane">
			
			<div class="header">
				<div class="header-inner">

					<span class="settings-btn" data-set-page="settings" >
						<svg version="1.1" viewBox="0 0 48 50" width="48px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M39.964,18.432c-0.192-0.476-0.284-0.938-0.517-1.392l4.238-7.648l-1.838-1.87l-1.387-1.401L38.6,4.252  l-8.193,4.727c-0.048-0.019-0.096-0.026-0.144-0.029L27.635,0h-2.644H24h-0.991h-2.644l-2.628,8.95  c-0.048,0.002-0.096,0.01-0.144,0.029L9.4,4.252l-1.861,1.87L6.152,7.523l-1.838,1.87l4.238,7.648  c-0.232,0.454-0.324,0.916-0.517,1.392L0,20.865v2.644v1.982v2.644l7.626,2.314c0.224,0.682,0.245,1.342,0.547,1.984l-3.921,7.184  l1.87,1.877l1.401,1.417l1.869,1.901l7.181-3.859c0.462,0.218,0.936,0.539,1.419,0.716L20.365,50h2.644H24h0.991h2.644l2.373-8.331  c0.483-0.177,0.957-0.498,1.419-0.716l7.181,3.859l1.869-1.901l1.401-1.417l1.87-1.877l-3.921-7.184  c0.302-0.643,0.323-1.303,0.547-1.984L48,28.135v-2.644v-1.982v-2.644L39.964,18.432z M24,33.475c-4.736-0.261-8.5-4.174-8.5-8.975  c0-4.801,3.764-8.714,8.5-8.975c4.736,0.261,8.5,4.173,8.5,8.975C32.5,29.301,28.736,33.214,24,33.475z"/></svg>
					</span>
					
					<div class="header-partial partial-recover">
						<button class="trigger-recover-single primary" title="Recover just this entry">Recover</button>
						<button class="trigger-recover-single-to-target primary" title="Recover this entry into a new target (The original input field does not exist anymore or has been moved.)">Recover to target</button>
						<button class="trigger-recover-session" title="Recover everything you typed that page load">Recover session</button>
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
						<div class="stats">
							<i class="icon icon-clock"></i> <span class="date"></span>
							<i class="icon icon-stats"></i> <span class="size"></span>

							<div class="health-ok">
								<svg version="1.0" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><polyline clip-rule="evenodd" fill="none" fill-rule="evenodd" points="  21.2,5.6 11.2,15.2 6.8,10.8 " stroke="#000000" stroke-miterlimit="10" stroke-width="2"/><path d="M19.9,13c-0.5,3.9-3.9,7-7.9,7c-4.4,0-8-3.6-8-8c0-4.4,3.6-8,8-8c1.4,0,2.7,0.4,3.9,1l1.5-1.5C15.8,2.6,14,2,12,2  C6.5,2,2,6.5,2,12c0,5.5,4.5,10,10,10c5.2,0,9.4-3.9,9.9-9H19.9z"/></svg>
								<span class="text">Target found</span>
							</div>
							<div class="health-bad">
								<svg version="1.0" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M13,17h-2v-2h2V17z M13,13h-2V7h2V13z"/><g><path d="M12,4c4.4,0,8,3.6,8,8s-3.6,8-8,8s-8-3.6-8-8S7.6,4,12,4 M12,2C6.5,2,2,6.5,2,12c0,5.5,4.5,10,10,10s10-4.5,10-10   C22,6.5,17.5,2,12,2L12,2z"/></g></svg>
								<span class="text">Target not found</span>
							</div>
						</div>
					</div>
					<div class="full-text">
						Select an entry to the left.
					</div>
				</div>
				<div class="content-partial partial-settings">
					<div class="inner-content">
						<p><a href="#" class="trigger-delete-all">Delete all</a> saved data for this site.</p>
						<p><a href="#" class="trigger-open-extension-settings">Open extension settings</a></p>
						<hr>
						<p>Is something broken? Leave feedback or feature requests on our <a target="_blank" href="https://bitbucket.org/nicklassandell/chrome-form-recovery/issues?status=new&status=open">bitbucket page</a>. Are you a developer? Tyio Form Recovery is open sourced, feel free to contribute!</p>
					</div>
				</div>
				<div class="content-partial partial-default partial-current">
					<div class="centered">
						<svg class="big-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h48v48h-48z" fill="none"/><path d="M25.99 6c-9.95 0-17.99 8.06-17.99 18h-6l7.79 7.79.14.29 8.07-8.08h-6c0-7.73 6.27-14 14-14s14 6.27 14 14-6.27 14-14 14c-3.87 0-7.36-1.58-9.89-4.11l-2.83 2.83c3.25 3.26 7.74 5.28 12.71 5.28 9.95 0 18.01-8.06 18.01-18s-8.06-18-18.01-18zm-1.99 10v10l8.56 5.08 1.44-2.43-7-4.15v-8.5h-3z"/></svg>
						<p>Select an entry to the left or view the <a data-set-page="settings">settings</a> for this domain.</p>
					</div>
				</div>
			</div>

		</div>
	</div>
</div>