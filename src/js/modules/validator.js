import Editable from "../classes/Editable";
import Options from "./options/options";

let validator = {};

var validators = {
  elem: [],
  value: [],
};

validator.validate = function (editable, type) {
  if (!(editable instanceof Editable)) return false;

  // Check only a specific type
  if (type) {
    return checkType(editable, type);

    // Check everything
  } else {
    for (type in validators) {
      if (!checkType(editable, type)) return false;
    }
  }

  return true;
};

function checkType(editable, type) {
  for (var fi in validators[type]) {
    if (!validators[type][fi](editable)) {
      return false;
    }
  }
  return true;
}

// Password type check
validators.elem.push(function (editable) {
  if (
    editable.el.nodeName.toLowerCase() === "input" &&
    editable.el.type === "password" &&
    Options.get("savePasswords") !== true
  ) {
    return false;
  }
  return true;
});

// Typio ignore field check
validators.elem.push(function (editable) {
  return !editable.el.classList.contains("typioIgnoreField");
});

// Credit card value check
validators.value.push(function (editable) {
  if (editable.isTextEditable()) {
    let value = editable.getValue(),
      isCard = /^[0-9\-\s]{8,22}$/.test(value);

    if (isCard && Options.get("saveCreditCards") !== true) {
      return false;
    }
  }

  return true;
});

// Cannot be here because it'll be false on first focus and will trigger
// weird stuff due to being invalid like broken saveindicator
// Empty value check
// validators.value.push(editable => {
// 	if(editable.isTextEditable() && editable.getValue().length === 0) {
// 		return false;
// 	}
// 	return true;
// });

export default validator;
