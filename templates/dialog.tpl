<div id="recovery-dialog" class="modal-container">
	<div class="modal">
		
		<div class="left">
			<div style="margin: 15px;">
				<p>Typio Form Recovery - {{ hostname }}</p>
				<div class="filter-container">
					<input style="width: 300px; border: 0; padding: 4px 12px; border-radius: 100px;" type="text" placeholder="Filter entries...">
					<input type="checkbox"> Hide small entries
				</div>
			</div>
			<div class="session-data"></div>
		</div>

		<div class="right">
			
			<div class="page page-default page-current">
				<div class="center">
					<svg class="icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h48v48h-48z" fill="none"></path><path d="M25.99 6c-9.95 0-17.99 8.06-17.99 18h-6l7.79 7.79.14.29 8.07-8.08h-6c0-7.73 6.27-14 14-14s14 6.27 14 14-6.27 14-14 14c-3.87 0-7.36-1.58-9.89-4.11l-2.83 2.83c3.25 3.26 7.74 5.28 12.71 5.28 9.95 0 18.01-8.06 18.01-18s-8.06-18-18.01-18zm-1.99 10v10l8.56 5.08 1.44-2.43-7-4.15v-8.5h-3z"></path></svg>

					<p>Select an entry to the left.</p>
					<br>
					<p>Psst. Did you know about the <a href="#">keyboard shortcuts</a>?</p>
				</div>
			</div>

			<div class="page page-entry">

				<div class="entry-header">
					<button class="btn btn-primary">Restore session</button>
					<button class="btn">Restore only this</button>
					<div class="btn-drop-container">
						<button class="btn">Copy &#9662;</button>
						<ul class="btn-drop">
							<li>Copy plain text</li>
							<li>Copy with formatting</li>
						</ul>
					</div>

					<p class="message">This entry can be restored automatically.</p>
				</div>

				<div id="entry-text" class="entry-text">entry text goes here</div>
				<div id="entry-path" class="entry-meta">body > form:nth-of-type(1) > input:nth-of-type(5)</div>
			</div>

		</div>

	</div>
</div>