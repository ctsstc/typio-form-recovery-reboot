import initHandler from "../../modules/initHandler";
import blacklist from "../../modules/blacklist";
import options from "../../modules/options/options";
import db from "../../modules/db/db";

blacklist.isBlocked(window.location.href, function (blocked) {
  if (blocked) {
    window.terafm.isBlocked = true;
  } else {
    // Load extension options into memory
    options.loadFromChromeStorage(function () {
      // Initiate DB, populate in-memory storage
      db.init(function () {
        // Run init handlers
        initHandler.executeInitHandlers();
        console.log("Typio is ready!");
      });
    });
  }
});
