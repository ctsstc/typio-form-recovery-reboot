<div id="keyboardShortcutPopup" class="modal-container">
	<div class="modal">

		<div class="modal-header">
			<p class="title">Typio Keyboard Shortcuts</p>
			<button data-action="close" class="close">
				<svg version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="info"/><g id="icons"><path d="M14.8,12l3.6-3.6c0.8-0.8,0.8-2,0-2.8c-0.8-0.8-2-0.8-2.8,0L12,9.2L8.4,5.6c-0.8-0.8-2-0.8-2.8,0   c-0.8,0.8-0.8,2,0,2.8L9.2,12l-3.6,3.6c-0.8,0.8-0.8,2,0,2.8C6,18.8,6.5,19,7,19s1-0.2,1.4-0.6l3.6-3.6l3.6,3.6   C16,18.8,16.5,19,17,19s1-0.2,1.4-0.6c0.8-0.8,0.8-2,0-2.8L14.8,12z" id="exit"/></g></svg>
			</button>
		</div>

		<div class="modal-content">

			{{keybindDisabledMessage}}

			<!-- <p class="group-title">General</p> -->
			<div class="combo-group">
				<div class="combo">
					<p class="description">Open/Close recovery dialog</p>
					<p class="keys">{{keybindToggleRecDiag}}</p>
				</div>
				<div class="combo">
					<p class="description">Restore previous session</p>
					<p class="keys">{{keybindRestorePreviousSession}}</p>
				</div>
			</div>

			<!-- <p class="group-title">Quick Restore</p> -->
			<div class="combo-group">
				<div class="combo">
					<p class="description">Open Quick Restore for focused field</p>
					<p class="keys">{{keybindOpenQuickAccess}}</p>
				</div>
				<div class="combo">
					<p class="description">Navigate items</p>
					<p class="keys"><span class="key">▲</span> <span class="key">▼</span></p>
				</div>
				<div class="combo">
					<p class="description">Select item</p>
					<p class="keys"><span class="key">Space</span></p>
				</div>
			</div>


			<div style="text-align: center;"><a data-action="open-options" href="#">Change keyboard combinations in options</a></div>

		</div>
	</div>
</div>