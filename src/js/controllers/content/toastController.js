import ui from "../../modules/ui";
import ToastComponent from "../../vue/backendApp/components/Toast.vue";
import Vue from "vue";
let controller = {};

let vue;

controller.create = function (message) {
  build(function () {
    vue.showMessage(message);
  });
};

function build(callback) {
  if (vue) return callback && callback();

  ui.inject(
    {
      html: '<div id="tmp-toast-holder"></div>',
      returnNode: "#tmp-toast-holder",
    },
    function (rootnode) {
      makeVue(rootnode, () => {
        if (callback) callback();
      });
    },
  );
}

function makeVue(rootnode, callback) {
  vue = new Vue({
    el: rootnode,
    render(h) {
      return h(ToastComponent);
    },
  });
  vue = vue.$children[0];

  if (callback) requestAnimationFrame(() => requestAnimationFrame(callback));
}

export default controller;
