Fix: All injected html is now within one parent shadowdom (used multiple before but that's deprecated).
Fix: Improved error message if trigger context before page load etc
Fix: Support for nested shadow dom and iframes
Change: "Pick recovery target" replaced with Copy button.
For devs: This update brings major improvements to the modularity of the code and should make it a lot easier to get a grasp on if you want to contribute.

Todo:
- Better test pages
- Replace toast with blinky thing in corner (with debounce)
- Add master password
- Concat all shadowroot css
- Compare getpath old vs new to make sure no changes are found
- I don't think radios work correctly within iframes/shadowdom
- Certain websites break ext on refresh (i think it resets document.body, e.g. turbolinks)
- Remove bak files
- Ignore credit card numbers
- Check out shroot stuff
- injectHTML could be moved
- Capsulation injection check type and allowance
- Use reflector class for db? To check if db has initiated in each method. Maybe.