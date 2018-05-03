<div id="keyboardShortcutPopup" class="modal-container">
	<div class="modal">

		<div class="modal-header">
			<p class="title">Typio Keyboard Shortcuts</p>
			<button data-action="close" class="close">
				ICON
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