New: Save indicator to reassure you your text is being saved as you type. Has various styles to choose from and can be disabled in settings.
Fix: All injected html is now within one parent shadowdom (used multiple before but that's deprecated).
Fix: Improved error message if trigger context before page load etc
Fix: Support for nested shadow dom and iframes
Fix: Concat all shadowroot css
Change: "Pick recovery target" replaced with Copy button.
For devs: This update brings major improvements to the modularity of the code and should make it a lot easier to get a grasp on if you want to contribute.


Todo:
- Cache things
- Figure out how to bubble events from inside iframes
	- No longer have to include editableManager and others in frame injection = win
	- Do not include entire frame script in frames, just the nessesary functions (inline script)
		- Win because no load time = faster encapsulation injection = fuck yes!
- Break up editableManager into sub modules
- Check out shroot stuff
- injectHTML could be moved
- Capsulation injection check type and allowance

- Better test pages
- Add master password	
	- With timestamp when pass reset
	- If pass was reset, delete old revisions on page load
- Compare getpath old vs new to make sure no changes are found
- I don't think radios work correctly within iframes/shadowdom
- Certain websites break ext on refresh (i think it resets document.body, e.g. turbolinks)
- Remove bak files
- Ignore credit card numbers