# Typio Form Recovery

This is the repository for the Typio Form Recovery app found here:
https://chrome.google.com/webstore/detail/typio-form-recovery/djkbihbnjhkjahbhjaadbepppbpoedaa

Please submit feedback or bugs on the [issues page](https://bitbucket.org/nicklassandell/chrome-form-recovery/issues?status=new&status=open).

Pull requests are welcome if you'd like to contribute.

# Changelog

### Version 1.6 (Jan 11th 2018)
Primarily a maintenance release. Improves performance and fixes a couple minor annoyances.

- New: Added navigation to options page
- New: Toolbar popup has been redesigned
- New: Save to database is now delayed to prevent stress on storage and improve performance.
- Fix: Fixed bug that sometimes caused multiple domains to be removed from blacklist when unblocking.
- Fix: Minor improvement to save indicator animation to prevent stutter
- Change: Current session data is now visible in recovery dialog to avoid confusion. It was previously hidden by design, because generally you will never need to recover data that is already present.

### Version 1.5 (Dec 15th 2017)
Fixes some pesky bugs and introduces some new features.

- New: You can now pick your own color for the save indicator (see options)
- New: Moved "hide small entries" option onto top of entry list for better access
- New: Typio now attempts to ignore credit card numbers (see option in settings)
- New: Redesigned options page
- New: Better display of field type in Recovery Dialog (field name and type)
- New: Added subtle bounce animation for switching pages in recovery dialog
- New: Slightly delayed frame script injection to allow more time for DOM to finish loading dynamic content (like dynamically created frames)
- Change: Removed word count in Recovery Dialog in favor of field type
- Fix: Changed behaviour of saveIndicator to animate on focus (previously only animated first time an input was focused due to a bug)
- Fix: Typio now ignores any inputs from within the recovery dialog ("hide small entries" checkbox is now ignored)
- Fix: Fixed Recovery Dialog ghost effect on close and added close animation.
- Fix: Critical bugfix for frame injection script that caused certain editors to believe the text had been changed
	- Issue was due to Typio injecting a script tag into each frame. I found an alternative solution to this that doesn't inject any content but rather executes code directly in the frame. This is a much better approach.



### Version 1.4 (Dec 13th 2017)
This update has been in the works for quite a while and brings lots of exciting changes. Under the hood it has undergone a full re-write to optimize the code base and make it easier to work with, but it brings plenty of visible changes as well:

- New: Save indicator to reassure you your text is being saved as you type. Has various styles to choose from and can be disabled in settings.
- New: Support for chat apps (dynamically cleared inputs)
- New: Keyboard shortcuts! Press Ctrl + Delete once to open recovery dialog, press twice to restore previous session.
- New: Context menu now also shows recent entries from other fields
- New: Added option for showing/hiding small values in recovery dialog
- New: Support for nested iframes/shadow dom (better support for modern sites)
- New: Input field type is now stored and displayed in Recovery Dialog
- Fix: Better performance in context menu when big entries are previewed (added truncation)
- Fix: Code is now concatenated to reduce http requests (both js and css)
- Fix: Improved error messages
- Fix: All Typio injected code is now placed within one parent shadowRoot (used to be separate)
- Change: "Pick recovery target" has been deprecated in favor of Copy button (it had issues with iframes and shadow dom)

### Version 1.3 (Aug 24 2017):
*Important!* This update will cause certain input fields to not display old entries in the context menu, but the old entries can still be found in the recovery dialog (right click > open form recovery) and can be recovered by manually selecting a target. The reason for this is due to a change in how every input field is assigned a unique ID to so that the extension can remember which text belongs to what field. The ID algorithm needed certain improvements, partly to add support for certain text editors (WYSIWYG in iframes).

- New: Delete entry link now asks you to confirm (double click)
- New: Support for WYSIWYG editors using iframes (if same host origin)
- Fixed: Lots of bugfixes

### Version 1.2 (Aug 21 2017):
- New: Added recovery dialog. Allows you to browse all saved data on a site and gives you advanced recovery options (rightclick > open form recovery).
- New: Flashes input fields when recovering (useful for recovering sessions).
- New: Faster storage. Now uses in memory storage with asynchronous flat file offloading.
- New: Delete entry button removed from context menu to decrease clutter. Entries can be deleted in recovery dialog instead.
- New: Added support for "select" dropdowns
- Fixed: Saved passwords even when option was set to disabled in some cases
- Fixed: "Delete all" should delete all except for current session
- Fixed: Max storage days is now one year (bug prevented setting higher than 7 days)
- Fixed: Better icon for "recover only this field" option in context menu

### Version 1.1:
- New: Added support for more input types, including check/radio boxes, range sliders, color, date etc.
- Fixed: Bug where empty fields were still saved in some cases.