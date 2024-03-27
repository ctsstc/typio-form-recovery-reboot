import KeyboardShortcuts from "../../modules/keyboardShortcuts";
import initHandler from "../../modules/initHandler";
import ui from "../../modules/ui";
import Options from "../../modules/options/options";
import blockController from "./blockController";
import RecoveryDialog from "../../vue/content/RecoveryDialog.vue";
import Vue, { createApp } from "vue";

let recoveryDialogController = {};

/** @type {Vue.Component<RecoveryDialog>} */
let recoveryDialog;

// Key comobo to open/close diag
initHandler.onInit(function () {
  if (Options.get("keybindEnabled")) {
    KeyboardShortcuts.on(Options.get("keybindToggleRecDiag"), function () {
      if (!recoveryDialog) return build();
      if (recoveryDialog.isVisible) {
        recoveryDialog.hide();
      } else {
        recoveryDialog.show();
      }
    });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "openRecoveryDialog") show();
});

recoveryDialogController.open = () => show();

function show() {
  if (terafm.isBlocked) return blockController.warn();
  if (recoveryDialog) {
    recoveryDialog.show();
  } else {
    build();
  }
}

function build(callback) {
  if (recoveryDialog) return callback && callback();

  ui.inject(
    {
      html: '<div id="tmp-dialog-holder"></div>',
      returnNode: "#tmp-dialog-holder",
      loadIcons: true,
    },
    function (rootNode) {
      makeVue(rootNode, callback);
    },
  );
}

function makeVue(rootNode, callback) {
  const vue = createApp(RecoveryDialog);
  recoveryDialog = vue.mount(rootNode);

  recoveryDialog.show();

  KeyboardShortcuts.on(["Escape"], function () {
    recoveryDialog.hide();
  });

  if (callback) callback();
}

export default recoveryDialogController;
