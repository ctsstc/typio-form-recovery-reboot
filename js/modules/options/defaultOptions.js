window.terafm = window.terafm || {};
window.terafm.defaultOptions = {};

// Default options as stored in database. Needs to be sanitized (keybindigs especially).
(function(defaultOptions, help) {
	'use strict';

	var def = {}
	
	def.savePasswords = false;
	def.saveCreditCards = false;
	def.storageTimeDays = 7;
	def.saveIndicator = 'topline';
	def.saveIndicatorColor = '#3CB720';
	def.hideSmallEntries = true;
	def.keybindEnabled = true;
	def.quickAccessButtonEnabled = true;
	def.quickAccessButtonTrigger = 'focus';
	def.cloneOnRestore = false;
	def.resetEditablesBetweenRestorations = false;
	def.qaGroupSessions = true;
	def.qaEnableSessionSubmenu = true;

	// Mac specific
	if(window.navigator.platform.toLowerCase().indexOf('mac') !== -1) {
		def.keybindToggleRecDiag = 'Control + Backspace';
		def.keybindRestorePreviousSession = 'Control + Alt + Backspace';
		def.keybindOpenQuickAccess = 'Control + r';

	// Windows and everything else
	} else {
		def.keybindToggleRecDiag = 'Alt + Backspace';
		def.keybindRestorePreviousSession = 'Shift + Alt + Backspace';
		def.keybindOpenQuickAccess = 'Alt + r';
	}
	



	defaultOptions.get = function(opt) {
		return opt in def ? def[opt] : undefined
	}

	defaultOptions.getAll = function() {
		return def
	}


})(terafm.defaultOptions, terafm.helpers);