// Heavily modified from: https://stackoverflow.com/a/16742828/290790
// Careful cause changing this will result in editableID's changing
// which results in entries not being shown in context menu
export default function (el) {
  // Cannot break out of capsules, return fake path
  try {
    window.top.document;
  } catch (e) {
    return generateFakePath();
  }

  var parentCapsule = getParentCapsule(el), // Will change as it breaks out
    isEncapsulated = parentCapsule ? true : false,
    isShadow = false;

  var stack = [],
    prevEl;

  while (el) {
    // console.log('curr el', el);

    // If top body, stop
    if (el === window.top.document.body) {
      stack.unshift("body");
      break;
    }

    // If capsule
    if (el === parentCapsule) {
      // console.log('reached capsule', el)

      // Shadow root. Add nothing to stack, break out
      if (el.toString() === "[object ShadowRoot]") {
        el = el.host;
        isShadow = true;
      }

      // Iframe body. Add to stack, break out
      else if (el.ownerDocument.defaultView.frameElement) {
        el = el.ownerDocument.defaultView.frameElement;
      }

      // Find next parent capsule
      parentCapsule = getParentCapsule(el);
      // console.log('next parent capsule is', parentCapsule)

      continue;
    }

    // If el has ID
    if (
      el.id &&
      el.id.length > 1 /*&& el.id.match(/^[a-z0-9._-]+$/i) !== null*/
    ) {
      let escId = CSS.escape(el.id);

      // var idCount = el.ownerDocument.querySelectorAll('#' + el.id);
      var idCount = el.ownerDocument.querySelectorAll("#" + escId);

      // If not encapsulated, add to stack and stop
      if (!isEncapsulated && idCount.length === 1) {
        stack.unshift("#" + escId);
        break;
      }

      // If encapsulated, add to stack and break out
      else if (idCount.length === 1) {
        var nodeName = "#" + escId;
        if (isShadow) {
          nodeName += "::shadow";
          isShadow = false;
        }
        if (el.nodeName === "IFRAME") {
          nodeName = "iframe" + nodeName;
        }
        stack.unshift(nodeName);

        if (parentCapsule) {
          if (parentCapsule.toString() === "[object ShadowRoot]") {
            el = parentCapsule.host;
            isShadow = true;
          } else {
            el = parentCapsule.ownerDocument.defaultView.frameElement;
          }
          parentCapsule = getParentCapsule(el);
        } else {
          el = el.parentNode;
        }
        continue;
      }
    }

    var nodeName = el.nodeName.toLowerCase();

    var sibIndex = getSiblingIndex(el);
    if (sibIndex !== false) {
      nodeName += ":nth-of-type(" + sibIndex + ")";
    }
    if (isShadow) {
      nodeName += "::shadow";
      isShadow = false;
    }

    stack.unshift(nodeName);
    el = el.parentNode;
  }

  stack = stack.join(" > ");

  return stack;
}

function generateFakePath() {
  return "#unidentified-" + Math.round(Math.random() * 10000000);
}

function getSiblingIndex(el) {
  var sibCount = 0;
  var sibIndex = 0;

  // get sibling indexes
  for (var i = 0; i < el.parentNode.childNodes.length; i++) {
    var sib = el.parentNode.childNodes[i];
    if (sib.nodeName == el.nodeName) {
      if (sib === el) {
        sibIndex = sibCount;
      }
      sibCount++;
    }
  }

  return sibCount > 1 ? sibIndex + 1 : false;
}

function getParentCapsule(node) {
  let caps = getParentShadowHost(node) || getParentIframe(node) || false;
  // console.log('parent capsule', caps);
  return caps;
}

function getParentShadowHost(node) {
  // Is in shadow DOM?
  for (; node; node = node.parentNode) {
    if (node.toString() === "[object ShadowRoot]") {
      return node;
    }
  }
}

function getParentIframe(node) {
  // Is in iframe?
  // console.dir(node);
  if (node.ownerDocument && node.ownerDocument.defaultView.frameElement) {
    return node.ownerDocument.documentElement;
  }
}

function getCapsuleHost(node) {
  if (node.ownerDocument.defaultView.frameElement) {
    return node.ownerDocument.defaultView.frameElement;
  } else if (node.host) {
    return node.host;
  }
}
