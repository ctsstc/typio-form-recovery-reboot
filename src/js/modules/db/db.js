import Entry from "../../classes/Entry";
import StorageBucket from "../../classes/StorageBucket";
import Events from "../../modules/Events";
import Helpers from "../../modules/Helpers";

const db = {};

const domainId = "###" + window.location.hostname;

let buckets = {
  inUse: new StorageBucket(domainId),
  snapshot: new StorageBucket(domainId),
};
buckets.applyOne = (fn) => {
  let res = fn(buckets.inUse);
  if (res.length) return res;
  else return fn(buckets.snapshot);
};
buckets.applyBoth = (fn) => {
  let merged = mergeBuckets(buckets.inUse, buckets.snapshot);
  return fn(merged);
};

function mergeBuckets(b1, b2) {
  if (!(b1 instanceof StorageBucket) || !(b2 instanceof StorageBucket))
    throw new Error(`Merge requires two buckets to merge.`);

  let b3 = new StorageBucket(domainId, b1.copy().context),
    [f2, f3] = [b2.fields, b3.fields];

  // console.time('Merge buckets');
  for (let eid in f2) {
    if (!f3.hasOwnProperty(eid)) {
      f3[eid] = f2[eid];
    } else {
      for (let sid in f2[eid].sess) {
        if (!f3[eid].sess.hasOwnProperty(sid)) {
          f3[eid].sess[sid] = f2[eid].sess[sid];
        }
      }
    }
  }
  // console.timeEnd('Merge buckets');

  return b3;
}

// Will override context metadata if present. Make updateSnapshotFields() function if needed.
function fetchSnapshot() {
  return new Promise((done, reject) => {
    try {
      chrome.storage.local.get(domainId, (data) => {
        buckets.snapshot.set(data);
        done();
      });
    } catch (error) {
      // console.error("Error fetching snapshot", { error })
      reject(error);
    }
  });
}

async function fetchAndMerge() {
  await fetchSnapshot();

  let ts = mergeBuckets(buckets.inUse, buckets.snapshot);

  if (!ts.hasOwnProperty("context") || !ts.context.hasOwnProperty(domainId)) {
    throw new Error("Attempted to write garbish to database. Careful!");
  }

  return ts;
}

function pushBucket(bucket) {
  // console.log("PUSH BUCKET", { bucket });
  return new Promise((done) => {
    if (
      !(bucket instanceof StorageBucket) ||
      !bucket.hasOwnProperty("context") ||
      !bucket.context.hasOwnProperty(domainId)
    )
      throw new Error("Can not push non-buckets to database.");
    chrome.storage.local.set(bucket.context, () => {
      // console.log('pushed bucket', bucket)
      Events.trigger("db-save");
      done();
    });
  });
}

// Fetch, merge, push
function sync() {
  // console.log("sync");
  return fetchAndMerge().then(pushBucket);
}

db.init = function (done) {
  // chrome.storage.local.clear();return;
  // console.log(buckets);
  fetchSnapshot().then(done);
};

db.fetch = () => {
  return fetchSnapshot();
};

db.push = () => {
  return sync();
};

db.saveEntry = (entry) => {
  buckets.inUse.setEntry(entry);
  debouncePush();
};

db.getSessions = (max) => {
  return buckets.applyBoth((buck) => buck.getSessions(false, max));
};

db.getSession = (sid) => {
  return buckets.applyOne((buck) => buck.getSession(sid));
};

db.getEntries = (max, excludeEid, filterFn) => {
  return buckets.applyBoth((buck) =>
    buck.getEntries(max, excludeEid, filterFn),
  );
};

db.getSessionsContainingEditable = (eid, max) => {
  return buckets.applyBoth((buck) =>
    buck.getSessionsContainingEditable(eid, max),
  );
};

db.getLatestSession = () => {
  return buckets.snapshot.getLatestSession();
};

db.getEntry = (...args) => {
  return buckets.applyOne((buck) => buck.getEntry(...args));
};

db.deleteEntry = (...args) => {
  let sessionId, editableId, callback;

  if (args[0] instanceof Entry) {
    sessionId = args[0].sessionId;
    editableId = args[0].editableId;
    callback = args[1];
  } else {
    sessionId = args[0];
    editableId = args[1];
    callback = args[2];
  }

  fetchAndMerge().then((mergeBuck) => {
    buckets.inUse.del(sessionId, editableId);
    mergeBuck.del(sessionId, editableId);
    pushBucket(mergeBuck).then(fetchSnapshot).then(callback);
  });
};

// Array of entries, or array of [sessionId, editableId]
db.deleteEntries = (entriesToDelete, callback) => {
  fetchAndMerge().then((mergeBuck) => {
    for (const entryData of entriesToDelete) {
      let sessionId, editableId;

      if (entryData instanceof Entry) {
        sessionId = entryData.sessionId;
        editableId = entryData.editableId;
      } else {
        sessionId = entryData[0];
        editableId = entryData[1];
      }

      buckets.inUse.del(sessionId, editableId);
      mergeBuck.del(sessionId, editableId);
    }
    pushBucket(mergeBuck).then(fetchSnapshot).then(callback);
  });
};

db.deleteAllDataForDomain = () => {
  buckets.inUse.empty();
  buckets.snapshot.empty();
  pushBucket(buckets.snapshot).then(fetchSnapshot);
};

db.getDomainSize = () => {
  return new Promise((done) => {
    chrome.storage.local.getBytesInUse(domainId, done);
  });
};

var debouncePush = Helpers.throttle(sync, 1000, { leading: false });

export default db;
