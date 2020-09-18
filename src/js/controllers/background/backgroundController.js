// Controllers
import './listenerController.js';
import './maintenanceController.js';
import './contextMenuController.js';
import './splashController.js';


// In case i need it for future stuff
chrome.storage.sync.set({version: 2});
// chrome.storage.local.clear();

// chrome.tabs.create({
//     url: 'chrome-extension://lpbjhmjpobgjcacflfibadcfimmbpmal/html/app.html#/database-manager',
// })