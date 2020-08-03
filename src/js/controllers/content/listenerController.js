import blockController from './blockController';
import toastController from './toastController';
import db from '../../modules/db/db';

// Messages from background.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.action === 'clearData') {
        if(window.terafm.isBlocked) return blockController.warn();
        db.deleteAllDataForDomain();
        toastController.create('Database cleared for ' + window.location.hostname);
    }
});