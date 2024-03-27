let exports = {};

let storageData = {},
  storageKeys = [];

exports.cache = function (key, cacheFunction) {
  let keyId = storageKeys.indexOf(key);
  if (keyId !== -1) {
    return storageData[keyId];
  }

  keyId = storageKeys.push(key) - 1;
  storageData[keyId] = cacheFunction();

  return storageData[keyId];
};

exports.wipeCache = function () {
  storageData = {};
  storageKeys = [];
};

export default exports;
