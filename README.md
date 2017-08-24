# Typio Form Recovery

This is the repository for the Typio Form Recovery app found here:
https://chrome.google.com/webstore/detail/typio-form-recovery/djkbihbnjhkjahbhjaadbepppbpoedaa

Please submit feedback or bugs on the [issues page](https://bitbucket.org/nicklassandell/chrome-form-recovery/issues?status=new&status=open), or if you're up for the challenge, add/fix it yourself and send me a pull request. :)

# Changelog

### Version 1.3 (Aug 24 2017):
*Important!* This update will cause certain input fields to not display old entries in the context menu, but the old entries can still be found in the recovery dialog (right click > open form recovery) and can be recovered by manually selecting a target. The reason for this is due to a change in how every input field is assigned a unique ID to so that the extension can remember which text belongs to what field. The ID algorithm needed certain improvements, partly to add support for certain text editors (WYSIWYG in iframes).

New: Delete entry link now asks you to confirm (double click)
New: Support for WYSIWYG editors using iframes (if same host origin)
Fixed: Lots of bugfixes

### Version 1.2 (Aug 21 2017):
New: Added recovery dialog. Allows you to browse all saved data on a site and gives you advanced recovery options (rightclick > open form recovery).
New: Flashes input fields when recovering (useful for recovering sessions).
New: Faster storage. Now uses in memory storage with asynchronous flat file offloading.
New: Delete entry button removed from context menu to decrease clutter. Entries can be deleted in recovery dialog instead.
New: Added support for "select" dropdowns
Fixed: Saved passwords even when option was set to disabled in some cases
Fixed: "Delete all" should delete all except for current session
Fixed: Max storage days is now one year (bug prevented setting higher than 7 days)
Fixed: Better icon for "recover only this field" option in context menu

### Version 1.1:
New: Added support for more input types, including check/radio boxes, range sliders, color, date etc.
Fixed: Bug where empty fields were still saved in some cases.