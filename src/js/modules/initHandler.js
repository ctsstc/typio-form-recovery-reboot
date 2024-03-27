const initHandler = {};

let initHandlers = [],
  isInitiated = false;

initHandler.onInit = function (callback) {
  if (isInitiated) callback();
  else initHandlers.push(callback);
};

initHandler.executeInitHandlers = function () {
  isInitiated = true;
  initHandlers.forEach(function (func) {
    func();
  });
};

export default initHandler;
