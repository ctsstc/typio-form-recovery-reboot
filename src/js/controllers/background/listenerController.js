
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.action === 'openSettings') {
        chrome.runtime.openOptionsPage();
    }
});