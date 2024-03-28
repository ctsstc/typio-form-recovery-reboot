import Options from "../../modules/options/options";
import Events from "../../modules/Events";
import initHandler from "../../modules/initHandler";
import validator from "../../modules/validator";
import ui from "../../modules/ui";
import Vue from "vue";
import SaveIndicator from "../../vue/content/SaveIndicator.vue";

let vue;

initHandler.onInit(function () {
  let isEnabled = Options.get("saveIndicator") !== "disable";

  if (isEnabled) {
    addEventListeners();
  }
});

function addEventListeners() {
  Events.on("db-save", () => {
    if (vue) vue.animate();
  });

  Events.on("editable-text-focus", function () {
    build(function () {
      if (!validator.validate(window.terafm.focusedEditable)) {
        return false;
      }

      vue.show();
      vue.animate();
    });
  });

  Events.on("blur", function () {
    if (vue) vue.hide();
  });
}

function build(callback) {
  if (vue) return callback && callback();

  ui.inject(
    {
      html: '<div id="tmp-si-holder"></div>',
      returnNode: "#tmp-si-holder",
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
      return h(SaveIndicator);
    },
  });
  vue = vue.$children[0];
  if (callback) callback();
}
