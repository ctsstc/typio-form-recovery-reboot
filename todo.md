New: Save indicator to reassure you your text is being saved as you type. Has various styles to choose from and can be disabled in settings.
Fix: All injected html is now within one parent shadowdom (used multiple before but that's deprecated).
Fix: Improved error message if trigger context before page load etc
Fix: Support for nested shadow dom and iframes
Fix: Concat all shadowroot css
Fix: Support for inputs that are dynamically cleared (support for chat apps like fb messenger)
Change: "Pick recovery target" replaced with Copy button.
For devs: This update brings major improvements to the modularity of the code and should make it a lot easier to get a grasp on if you want to contribute.


Todo:
- Save input type
- Only show indicator if input can acutally be saved (path can be resolved)
- Iframe load support
- Check out shroot stuff
- injectHTML could be moved
- Capsulation injection check type and allowance
- Use 'input' event instead of change/keydown?
	- Combine with 'change' for checkboxes/radios because no support
- Cache more things

- Throttle input event? Useful for range inputs and probably others
- Better test pages
- Add master password	
	- With timestamp when pass reset
	- If pass was reset, delete old revisions on page load
- Compare getpath old vs new to make sure no changes are found
- I don't think radios work correctly within iframes/shadowdom
- Certain websites break ext on refresh (i think it resets document.body, e.g. turbolinks)
	- Try fix using window.onbeforeunload
- Remove bak files
- Ignore credit card numbers